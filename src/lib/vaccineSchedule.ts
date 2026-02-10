import { globalVaccineAPI } from "@/lib/api";

// Fallback schedule in case API fails or is offline
const fallbackSchedule = [
    { age: "At Birth", weeks: 0, vaccines: ["BCG", "Hepatitis B (Birth dose)", "OPV-0"] },
    { age: "6 Weeks", weeks: 6, vaccines: ["OPV-1", "Pentavalent-1", "Rotavirus-1", "IPV (Fractional dose-1)"] },
    { age: "10 Weeks", weeks: 10, vaccines: ["OPV-2", "Pentavalent-2", "Rotavirus-2"] },
    { age: "14 Weeks", weeks: 14, vaccines: ["OPV-3", "Pentavalent-3", "Rotavirus-3", "IPV (Fractional dose-2)"] },
    { age: "9-12 Months", weeks: 39, vaccines: ["Measles / MR - 1st dose", "JE - 1st dose", "Vitamin A - 1st dose"] },
    { age: "16-24 Months", weeks: 70, vaccines: ["DPT Booster-1", "Measles / MR - 2nd dose", "OPV Booster", "JE - 2nd dose", "Vitamin A - 2nd dose"] },
    { age: "5-6 Years", weeks: 261, vaccines: ["DPT Booster-2"] },
];

export const getStandardSchedule = async () => {
    try {
        const globalVaccines = await globalVaccineAPI.getAll();
        if (!globalVaccines || globalVaccines.length === 0) return fallbackSchedule;

        // Group by age category/weeks to match the schedule format
        const scheduleMap = new Map();

        globalVaccines.forEach((v: any) => {
            const key = `${v.weeks}-${v.ageCategory}`;
            if (!scheduleMap.has(key)) {
                scheduleMap.set(key, {
                    age: v.ageCategory,
                    weeks: v.weeks,
                    vaccines: []
                });
            }
            scheduleMap.get(key).vaccines.push(v.name);
        });

        return Array.from(scheduleMap.values()).sort((a, b) => a.weeks - b.weeks);
    } catch (e) {
        console.error("Failed to fetch global schedule", e);
        return fallbackSchedule;
    }
};

export const calculateSchedule = async (baby: any, existingVaccines: any[]) => {
    if (!baby.dateOfBirth) return [];

    const birthDate = new Date(baby.dateOfBirth);
    let allVaccines: any[] = [];

    // Get schedule dynamically
    const schedule = await getStandardSchedule();

    schedule.forEach((period: any) => {
        period.vaccines.forEach((vName: string) => {
            // Check if exists in DB
            const existing = existingVaccines.find((v: any) => v.name === vName);

            if (existing) {
                allVaccines.push({ ...existing, ageCategory: period.age });
            } else {
                // Calculate Due Date
                const dueDate = new Date(birthDate);
                dueDate.setDate(birthDate.getDate() + period.weeks * 7);

                let status = "pending";
                if (new Date() > dueDate) status = "overdue";

                allVaccines.push({
                    _id: `temp-${vName}-${period.age}`, // Temp ID
                    name: vName,
                    dueDate: dueDate.toISOString(),
                    status: status,
                    ageCategory: period.age,
                    isPredicted: true
                });
            }
        });
    });

    // Add any custom vaccines not in standard schedule
    existingVaccines.forEach((v: any) => {
        if (!allVaccines.some(av => (av._id === v._id) || (av.name === v.name && !av.isPredicted))) {
            allVaccines.push({ ...v, ageCategory: "Custom" });
        }
    });

    return allVaccines.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};
