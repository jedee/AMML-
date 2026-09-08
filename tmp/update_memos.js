const fs = require("fs");

function updateMemoFile(filePath, isMemoRegistry) {
  let content = fs.readFileSync(filePath, "utf-8");

  content = content.replace(/\s*\{\s*id:\s*"memo-onyinyechi-2"[\s\S]*?\},?/g, "");
  content = content.replace(/\s*\{\s*id:\s*"memo-onya-ojiji-annual-2"[\s\S]*?\},?/g, "");

  const adamuMemo = `      {
        id: "memo-adamu-mustapha-abba",
        to: "ADAMU MUSTAPHA ABBA",
        staffId: "AMML-075",
        date: "July 17th, 2026",
        subject: "RE: APPLICATION FOR TEN (10) WORKING DAYS LEAVE",
        dates: "Monday, 20th July – Friday, 31st July, 2026",
        startDate: "2026-07-20",
        endDate: "2026-07-31",
        reliever: "Henry Dimesoro",
        relieverId: "AMML-C32",
        resumeDate: "Monday, 3rd August 2026",
        approvedDays: "Ten (10)",
        isExam: false,
        market: "Wuse Market",
        cc: ["Ag.MD/CEO", "HEAD OPS", "HEAD, F&A", "HEAD, AUDIT", "MANAGER, WUSE MARKET", "HENRY DIMESORO"],
        inconsistencies: [],
        synced: false,
        corrected: false,
        status: 'approved'${isMemoRegistry ? ' as const' : ''},
        body: "Please refer to your memo on the above subject matter dated July 14th, 2026. This is to convey management's approval of your request to proceed on Ten (10) days' annual leave from the 2026 financial year. This is with effect from Monday, 20th July – Friday, 31st July, 2026. Henry Dimesoro will cover your schedule while you are away. Please ensure you do a comprehensive handover of your schedule of duties to him before you proceed and copy the undersigned. You are to resume duty on Monday, 3rd August 2026. Enjoy your leave period."
      }`;

  if (!content.includes("memo-adamu-mustapha-abba")) {
    const idx = content.indexOf('id: "memo-saad-december-2026"');
    if (idx !== -1) {
      const endObj = content.indexOf("}", idx);
      const insertPos = endObj + 1;
      content = content.slice(0, insertPos) + ",\n" + adamuMemo + content.slice(insertPos);
    }
  }

  fs.writeFileSync(filePath, content, "utf-8");
  console.log("Updated " + filePath);
}

updateMemoFile("src/components/amml/MemoRegistry.tsx", true);
updateMemoFile("src/components/amml/ReportsView.tsx", false);
