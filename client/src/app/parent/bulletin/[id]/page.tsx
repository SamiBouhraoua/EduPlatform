"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { downloadBulletinPDF } from "@/app/student/bulletin/utils/downloadBulletinPDF";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ParentStudentBulletin() {
    const params = useParams();
    const studentId = params.id as string;

    const [student, setStudent] = useState<any>(null);
    const [courses, setCourses] = useState<any[]>([]);
    const [grades, setGrades] = useState<any[]>([]);
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const collegeStr = typeof window !== "undefined" ? localStorage.getItem("college") : null;
    const college = collegeStr ? JSON.parse(collegeStr) : null;

    const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
    const collegeId = typeof window !== "undefined" ? localStorage.getItem("collegeId") : "";

    useEffect(() => {
        if (!studentId || !token) return;

        async function loadData() {
            try {
                // 1. Fetch Student Info (from Users list or specific endpoint)
                // Since we don't have a direct /users/:id GET that is public/easy, we use list with filter or cache?
                // Actually /users/:id GET is not defined in auth-controller explicitly? Wait, user.controller has get? No.
                // It has listUsers. 
                // Let's use listUsers and find. optimizing later.
                const usersRes = await api.get(`/users?collegeId=${collegeId}`);
                const foundStudent = usersRes.data.find((u: any) => u._id === studentId);
                if (foundStudent) setStudent(foundStudent);


                // 2. Fetch Enrollments for THIS student
                const enrollRes = await api.get(
                    `/academic/enrollments?collegeId=${collegeId}&studentId=${studentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const myEnrollments = enrollRes.data; // Server already filtered/populated

                const courseIds = myEnrollments.map((e: any) =>
                    typeof e.courseId === "object" ? e.courseId._id : e.courseId
                );

                // 3. Fetch Full Courses Details
                const coursesRes = await api.get(`/academic/courses/full`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-college-id": collegeId
                    }
                });
                const myCourses = coursesRes.data.filter((c: any) =>
                    courseIds.includes(c._id)
                );
                setCourses(myCourses);

                // 4. Fetch All Grades (and filter for student)
                const gradesRes = await api.get(`/academic/grades`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "x-college-id": collegeId
                    }
                });
                // Filter grades for this student only
                const studentGrades = gradesRes.data.filter((g: any) => {
                    const gStudentId = typeof g.studentId === "object" ? g.studentId._id : g.studentId;
                    return String(gStudentId) === String(studentId);
                });
                setGrades(studentGrades);

                // 5. Fetch Grade Items (per course)
                let allItems: any[] = [];
                for (const cid of courseIds) {
                    const itemsRes = await api.get(
                        `/academic/grades/items/by-course/${cid}`,
                        { headers: { Authorization: `Bearer ${token}`, "x-college-id": collegeId } }
                    );

                    // Validate items
                    const validItems = itemsRes.data.filter((i: any) => i.categoryId && i.categoryId._id);
                    allItems = [...allItems, ...validItems];
                }
                setItems(allItems);

            } catch (err) {
                console.error("❌ PARENT BULLETIN LOAD ERROR:", err);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, [studentId]);


    // --- COMPUTE FINAL GRADE ---
    function computeFinalGrade(courseId: string) {
        const courseItems = items.filter(
            (i) =>
                String(i.courseId?._id || i.courseId) === String(courseId) &&
                i.categoryId &&
                i.categoryId._id
        );

        const courseGrades = grades.filter(
            (g) => String(g.courseId?._id || g.courseId) === String(courseId)
        );

        if (courseItems.length === 0) return null;

        // Missing grades?
        const missing = courseItems.filter(
            (it) => !courseGrades.some((g) => String(g.itemId?._id || g.itemId) === String(it._id))
        );
        if (missing.length > 0) return null;

        let earned = 0;
        let max = 0;

        for (const item of courseItems) {
            const grade = courseGrades.find(
                (g) => String(g.itemId?._id || g.itemId) === String(item._id)
            );

            if (grade) {
                earned += grade.score;
                max += grade.maxPoints ?? item.maxPoints;
            }
        }

        if (max === 0) return null;
        return Math.round((earned / max) * 100);
    }


    if (loading) return <div className="text-white text-center pt-20">Chargement du bulletin...</div>;
    if (!student) return <div className="text-white text-center pt-20">Étudiant introuvable.</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            {/* HEADER */}
            <div className="flex flex-col items-center justify-center relative">
                <Link
                    href="/parent"
                    className="absolute left-0 top-1 text-slate-400 hover:text-white flex items-center gap-2 transition"
                >
                    <ArrowLeft size={20} /> Retour
                </Link>

                <h1 className="text-4xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 to-red-400">
                    Bulletin Scolaire
                </h1>
                <p className="text-lg text-slate-300">
                    Élève : <span className="font-semibold text-white">{student.firstName} {student.lastName}</span>
                </p>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={() =>
                        downloadBulletinPDF({
                            user: student, // Pass student object so PDF has correct name
                            college,
                            courses,
                            computeFinalGrade,
                        })
                    }
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-3 rounded-xl font-medium shadow-lg shadow-orange-500/20 transition-all hover:scale-105"
                >
                    📄 Télécharger le bulletin
                </button>
            </div>

            <div className="space-y-6">
                {courses.map((course: any) => {
                    const final = computeFinalGrade(course._id);

                    return (
                        <div
                            key={course._id}
                            className="bg-slate-900/50 border border-white/5 p-8 rounded-2xl backdrop-blur-sm hover:border-orange-500/30 transition-all"
                        >
                            <div className="flex justify-between items-start gap-8">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="px-2 py-1 bg-white/5 rounded text-xs font-mono text-orange-300 border border-orange-500/20">
                                            {course.code}
                                        </span>
                                    </div>

                                    <h2 className="text-2xl font-bold text-white mb-4">
                                        {course.title}
                                    </h2>

                                    <div className="space-y-1 text-sm">
                                        <div className="flex gap-2">
                                            <span className="text-slate-500">Programme:</span>
                                            <span className="text-slate-300">{course.programId?.name}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-sm text-slate-500 mb-2 uppercase tracking-wider">Note finale</p>

                                    {final === null ? (
                                        <p className="text-slate-500 italic text-lg">
                                            Non disponible
                                        </p>
                                    ) : (
                                        <p
                                            className={`text-5xl font-bold ${final >= 80 ? "text-emerald-400" :
                                                    final >= 60 ? "text-amber-400" : "text-red-400"
                                                }`}
                                        >
                                            {final}%
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {courses.length === 0 && (
                    <p className="text-center text-slate-500 italic">Aucun cours trouvé pour cet étudiant.</p>
                )}
            </div>
        </div>
    );
}
