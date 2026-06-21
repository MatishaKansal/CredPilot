export const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-IN")}`;

export const formatStatus = (status) =>
  (status || "pending").replaceAll("_", " ");

export const exportApplicationsCsv = (rows, filename = "credpilot-report.csv") => {
  if (!rows.length) return;

  const headers = [
    "Application ID",
    "Applicant",
    "Purpose",
    "Amount",
    "Status",
    "Risk Score",
    "Risk Level",
    "Officer",
    "Submitted",
    "Reviewed",
  ];

  const lines = rows.map((row) => [
    row.applicationId,
    row.fullName,
    row.loanPurpose,
    row.loanAmount,
    formatStatus(row.status),
    row.riskScore ?? "",
    row.riskLevel ?? "",
    row.officerName ?? "",
    row.createdAt ?? "",
    row.reviewedAt ?? "",
  ]);

  const csv = [headers, ...lines]
    .map((line) => line.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};
