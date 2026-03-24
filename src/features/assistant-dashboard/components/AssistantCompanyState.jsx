import React from "react";

const AssistantCompanyState = ({ 
    assistantNoCompany, 
    assistantNeedsSelect, 
    companies, 
    activeCompanyId, 
    setActiveCompanyId 
}) => {
    const renderNoCompanyState = () => (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-8">
            <div className="text-center">
                <div className="w-16 h-16 bg-edubot-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏢</span>
                </div>

                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Компания дайындалган эмес
                </h2>

                <p className="text-slate-600 dark:text-slate-400 mb-4">
                    Сиз азырынча эч бир компанияга байланыштырылган жоксуз. Иштей баштоо үчүн
                    администраторго же компания жетекчисине кайрылыңыз.
                </p>

                <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                    (RU) Вы пока не привязаны ни к одной компании. Обратитесь к администратору
                    или руководителю компании.
                </p>
            </div>
        </div>
    );

    const renderCompanySelector = () => (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg p-8">
            <div className="text-center">
                <div className="w-16 h-16 bg-edubot-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">🏢</span>
                </div>

                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
                    Компанияны тандаңыз
                </h2>

                <p className="text-slate-600 dark:text-slate-400 mb-6">
                    Сураныч, компанияны тандаңыз. Сиз бир нече компанияга байланыштырылгансыз.
                    <br />
                    (RU) Вы привязаны к нескольким компаниям — выберите, с какой работать.
                </p>

                <select
                    className="w-full max-w-md px-4 py-3 bg-white dark:bg-gray-700 border border-slate-200 dark:border-slate-600 rounded-xl text-slate-900 dark:text-white focus:ring-2 focus:ring-edubot-orange focus:border-transparent transition-all duration-200 shadow-sm"
                    value={activeCompanyId ?? ""}
                    onChange={(e) => setActiveCompanyId(e.target.value ? Number(e.target.value) : null)}
                >
                    <option value="">-- Компанияны тандаңыз --</option>
                    {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                            {company.name}
                            {company.role ? ` · ${company.role}` : ""}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );

    if (assistantNoCompany) {
        return renderNoCompanyState();
    }

    if (assistantNeedsSelect) {
        return renderCompanySelector();
    }

    return null;
};

export default AssistantCompanyState;
