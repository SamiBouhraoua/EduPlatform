export const roleLabel = (r?: string) => ({ student:"Étudiant", teacher:"Enseignant", admin:"Admin Collège", superadmin:"Super Admin", parent:"Parent" } as any)[r ?? "student"] ?? "Étudiant";
