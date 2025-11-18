import React, { useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCompany } from '../../services/api';
import toast from 'react-hot-toast';
import CompanyMembers from './CompanyMembers';
import CompanySettings from './CompanySettings';
import CompanyCourses from './CompanyCourses';
import { AuthContext } from '../../context/AuthContext';

export default function CompanyDetail() {
    const { id } = useParams();
    const companyId = Number(id);
    const [tab, setTab] = React.useState('settings'); // 'settings' | 'members' | 'courses'
    const [company, setCompany] = React.useState(null);
    const { user } = useContext(AuthContext);

    React.useEffect(() => {
        (async () => {
            try { setCompany(await getCompany(companyId)); }
            catch { toast.error('Компания маалыматын жүктөй албай жатам.'); }
        })();
    }, [companyId]);

    if (!company) return <div className="p-4">Жүктөлүүдө…</div>;

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">{company.name}</h1>
                <Link to="/companies" className="text-blue-600 hover:underline">← Артка</Link>
            </div>

            <div className="flex gap-2">
                <Tab active={tab === 'settings'} onClick={() => setTab('settings')}>Орнотуулар</Tab>
                <Tab active={tab === 'members'} onClick={() => setTab('members')}>Мүчөлөр</Tab>
                <Tab active={tab === 'courses'} onClick={() => setTab('courses')}>Курстар</Tab>
            </div>

            {tab === 'settings' && <CompanySettings company={company} onSaved={setCompany} />}
            {tab === 'members' && <CompanyMembers companyId={companyId} />}
            {tab === 'courses' && <CompanyCourses companyId={companyId} canManage={company?.role === 'company_admin' || user?.role === 'admin'} />}
        </div>
    );
}

function Tab({ active, onClick, children }) {
    return (
        <button onClick={onClick} className={`px-4 py-2 rounded ${active ? 'bg-blue-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>{children}</button>
    );
}
