import React from "react";

const AssistantDashboardHeader = ({ 
    isAssistant, 
    activeCompany, 
    totalStudents, 
    enrolledStudents, 
    courses 
}) => {
    return (
        <div className="bg-gradient-to-r from-edubot-dark to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-800 text-white mb-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <p className="text-sm uppercase tracking-wide text-edubot-orange font-medium">
                        Assistant Panel
                    </p>
                    <h1 className="text-3xl font-bold mt-1">📘 Assistant Dashboard</h1>

                    {isAssistant && activeCompany && (
                        <p className="text-sm text-slate-300 mt-2">
                            Ассистент катары сиз{" "}
                            <span className="font-semibold text-edubot-orange">{activeCompany.name}</span>{" "}
                            компаниясынын курстарын көрүп жатасыз.
                        </p>
                    )}
                </div>

                <div className="flex gap-6">
                    <div className="text-right">
                        <div className="text-2xl font-bold text-edubot-orange">{totalStudents}</div>
                        <div className="text-xs text-slate-300">Жалпы студенттер</div>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-bold text-edubot-orange">{enrolledStudents.length}</div>
                        <div className="text-xs text-slate-300">Катталган студенттер</div>
                    </div>

                    <div className="text-right">
                        <div className="text-2xl font-bold text-edubot-orange">{courses.length}</div>
                        <div className="text-xs text-slate-300">Жарыяланган курстар</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AssistantDashboardHeader;
