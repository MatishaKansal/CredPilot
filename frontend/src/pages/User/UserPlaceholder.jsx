const UserPlaceholder = ({ title }) => (
  <div className="px-4 py-6 md:px-8">
    <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
    <p className="text-sm font-semibold text-[#43567C]">Applicant</p>
    <h1 className="mt-1 text-2xl font-bold text-slate-950">{title}</h1>
    <p className="mt-2 text-sm text-slate-500">
      This section is ready in the applicant navigation and can be connected to its workflow next.
    </p>
    </div>
  </div>
);

export default UserPlaceholder;
