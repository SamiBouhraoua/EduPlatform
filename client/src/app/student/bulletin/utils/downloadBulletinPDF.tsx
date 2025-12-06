import jsPDF from "jspdf";

export function downloadBulletinPDF({
  user,
  college,
  courses,
  computeFinalGrade
}: {
  user: any;
  college: any;
  courses: any[];
  computeFinalGrade: (courseId: string) => number | null;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  let y = 40;

  // Palette pro
  const primary = [32, 90, 167];
  const success = [35, 155, 86];
  const danger = [200, 40, 40];
  const headerFill = [230, 235, 245];

  const [pr, pg, pb] = primary;
  const [hr, hg, hb] = headerFill;

  const collegeName = college?.name || "Établissement scolaire";
  const collegeCity = college?.city ? ` (${college.city})` : "";

  // ================================
  // HEADER PREMIUM
  // ================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(pr, pg, pb);
  doc.text(`${collegeName}${collegeCity}`, 40, y);

  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.setTextColor(60, 60, 60);
  doc.text("Bulletin Scolaire Officiel", 40, y);

  y += 18;

  doc.setDrawColor(pr, pg, pb);
  doc.setLineWidth(1.5);
  doc.line(40, y, 555, y);

  y += 30;

  // ================================
  // INFOS ÉTUDIANT
  // ================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(20, 20, 20);
  doc.text("Informations de l'étudiant", 40, y);

  y += 20;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Nom complet : ${user.firstName} ${user.lastName}`, 40, y);

  y += 16;

  doc.text(`Programme : ${courses[0]?.programId?.name ?? "—"}`, 40, y);

  y += 35;

  // ================================
  // TITRE SECTION RÉSULTATS
  // ================================
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Résultats par cours", 40, y);

  y += 20;

  const headerHeight = 30;

  // ================================
  // TABLEAU HEADER
  // ================================
  doc.setFillColor(hr, hg, hb);
  doc.rect(40, y, 515, headerHeight, "F");

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(40, 40, 40);

  const COL_CODE = 50;
  const COL_TITLE = 140;
  const COL_STATUS = 380;
  const COL_FINAL = 500;

  doc.text("Code", COL_CODE, y + 20);
  doc.text("Cours", COL_TITLE, y + 20);
  doc.text("Statut", COL_STATUS, y + 20);
  doc.text("Note", COL_FINAL, y + 20);

  y += headerHeight + 10;

  const gradedCourses = courses
    .map((c) => ({ ...c, final: computeFinalGrade(c._id) }))
    .filter((c) => c.final !== null);

  // ================================
  // LIGNES DU TABLEAU
  // ================================
  gradedCourses.forEach((c, index) => {
    const final = c.final;
    const isSuccess = final >= 60;

    const [sr, sg, sb] = success;
    const [dr, dg, db] = danger;

    const rowHeight = 28;
    const isEven = index % 2 === 0;

    // Fond alterné propre
    doc.setFillColor(isEven ? 255 : 247, 247, 247);
    doc.rect(40, y - 18, 515, rowHeight, "F");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);

    // Code
    doc.text(c.code, COL_CODE, y);

    // Titre long → multi-lignes
    const maxTitleWidth = 225;
    const titleLines = doc.splitTextToSize(c.title, maxTitleWidth);
    doc.text(titleLines, COL_TITLE, y);

    // Statut coloré
    if (isSuccess) doc.setTextColor(sr, sg, sb);
    else doc.setTextColor(dr, dg, db);

    doc.text(isSuccess ? "Réussi" : "Échec", COL_STATUS, y);

    // Note finale
    doc.text(`${final}%`, COL_FINAL, y);

    y += rowHeight;

    // Nouvelle page
    if (y > 760) {
      doc.addPage();
      y = 40;

      doc.setFillColor(hr, hg, hb);
      doc.rect(40, y, 515, headerHeight, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(40, 40, 40);

      doc.text("Code", COL_CODE, y + 20);
      doc.text("Cours", COL_TITLE, y + 20);
      doc.text("Statut", COL_STATUS, y + 20);
      doc.text("Note", COL_FINAL, y + 20);

      y += headerHeight + 10;
    }
  });

  // ================================
  // FOOTER
  // ================================
  doc.setFont("helvetica", "italic");
  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  doc.text(
    "Document généré automatiquement — EduPlatform © 2025",
    150,
    820
  );

  doc.save("bulletin.pdf");
}
