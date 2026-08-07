/**
 * Credit Score Service (Pure Function Module)
 * Computes a 0–100 buyer credit score derived from real GST data.
 * 
 * Formula Weighting:
 *  1. Filing consistency (% of expected periods filed in last 12 months) — 40%
 *  2. Filing timeliness (on-time vs late, if dates available) — 25%
 *  3. GSTIN status (Active = full marks, Suspended/Cancelled = heavy penalty) — 25%
 *  4. Business vintage (registration age) — 10%
 */

function parseDate(dateStr) {
  if (!dateStr) return null;
  const s = String(dateStr).trim();
  
  // DD-MM-YYYY or DD/MM/YYYY
  if (/^\d{2}[-/]\d{2}[-/]\d{4}$/.test(s)) {
    const parts = s.split(/[-/]/);
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
  }
  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return new Date(s);
  }
  const parsed = new Date(s);
  return isNaN(parsed.getTime()) ? null : parsed;
}

export function computeBuyerCreditScore(taxpayerData = {}, returnsData = [], asOfDate = new Date()) {
  const taxpayer = taxpayerData || {};
  const returns = Array.isArray(returnsData) ? returnsData : [];

  // 1. Filing Consistency (40%)
  const expectedFilings = 24; // 12 GSTR-1 + 12 GSTR-3B annual filings
  const validReturns = returns.filter(r => (r.status || '').toLowerCase() === 'filed' || r.valid === 'Y');
  const filingsCount = validReturns.length;
  const consistencyRatio = Math.min(1.0, filingsCount / expectedFilings);
  const consistencyScore = Number((consistencyRatio * 40.0).toFixed(1));

  // 2. Filing Timeliness (25%)
  let onTimeCount = 0;
  let evaluatedCount = 0;

  validReturns.forEach(ret => {
    const rtnType = String(ret.rtntype || '').toUpperCase();
    const retPrd = String(ret.ret_prd || '').trim(); // MMYYYY
    const dof = parseDate(ret.dof);

    if (!dof || retPrd.length !== 6) {
      onTimeCount++;
      evaluatedCount++;
      return;
    }

    try {
      const m = parseInt(retPrd.slice(0, 2), 10);
      const y = parseInt(retPrd.slice(2), 10);
      const nextM = m === 12 ? 0 : m; // JS 0-indexed month for next month
      const nextY = m === 12 ? y + 1 : y;
      const dueDay = rtnType.includes('1') ? 11 : 20;
      const dueDate = new Date(nextY, nextM, dueDay, 23, 59, 59);

      evaluatedCount++;
      if (dof.getTime() <= dueDate.getTime()) {
        onTimeCount++;
      }
    } catch {
      onTimeCount++;
      evaluatedCount++;
    }
  });

  const timelinessRatio = evaluatedCount > 0 ? onTimeCount / evaluatedCount : 1.0;
  const timelinessScore = Number((timelinessRatio * 25.0).toFixed(1));

  // 3. GSTIN Status (25%)
  const rawStatus = (taxpayer.status || 'Active').trim();
  let statusScore = 0;
  if (rawStatus.toLowerCase() === 'active') {
    statusScore = 25.0;
  } else if (rawStatus.toLowerCase() === 'suspended') {
    statusScore = 5.0;
  } else {
    statusScore = 0.0;
  }

  // 4. Business Vintage (10%)
  const regDateStr = taxpayer.registrationDate || taxpayer.regStartDate || '';
  const regDate = parseDate(regDateStr);
  let vintageYears = 5.0;
  if (regDate) {
    vintageYears = Math.max(0, (asOfDate.getTime() - regDate.getTime()) / (365.25 * 86400000));
  }

  let vintageScore = 4.0;
  if (vintageYears >= 5.0) vintageScore = 10.0;
  else if (vintageYears >= 3.0) vintageScore = 8.0;
  else if (vintageYears >= 1.0) vintageScore = 6.0;

  // Composite Score
  const totalScore = Math.max(0, Math.min(100, Math.round(consistencyScore + timelinessScore + statusScore + vintageScore)));

  let grade = 'AAA';
  let riskTier = 'Prime / Ultra-Low Risk';
  let recommendedAdvance = '90% - 95%';
  let badgeColor = 'emerald';

  if (totalScore >= 85) {
    grade = 'AAA';
    riskTier = 'Prime / Ultra-Low Risk';
    recommendedAdvance = '90% - 95%';
    badgeColor = 'emerald';
  } else if (totalScore >= 70) {
    grade = 'AA';
    riskTier = 'Strong / Low Risk';
    recommendedAdvance = '85% - 90%';
    badgeColor = 'blue';
  } else if (totalScore >= 55) {
    grade = 'A';
    riskTier = 'Moderate / Standard Risk';
    recommendedAdvance = '75% - 85%';
    badgeColor = 'amber';
  } else if (totalScore >= 40) {
    grade = 'BBB';
    riskTier = 'Subprime / Elevated Risk';
    recommendedAdvance = '65% - 75%';
    badgeColor = 'orange';
  } else {
    grade = 'C';
    riskTier = 'High Risk / Critical Review';
    recommendedAdvance = '50% - 60%';
    badgeColor = 'red';
  }

  return {
    score: totalScore,
    grade,
    riskTier,
    recommendedAdvanceRate: recommendedAdvance,
    badgeColor,
    breakdown: {
      filingConsistency: {
        score: consistencyScore,
        max: 40.0,
        weight: '40%',
        filingsCount,
        expectedCount: expectedFilings,
        percentage: Number((consistencyRatio * 100).toFixed(1))
      },
      filingTimeliness: {
        score: timelinessScore,
        max: 25.0,
        weight: '25%',
        onTimeCount,
        evaluatedCount,
        percentage: Number((timelinessRatio * 100).toFixed(1))
      },
      gstinStatus: {
        score: statusScore,
        max: 25.0,
        weight: '25%',
        status: rawStatus
      },
      businessVintage: {
        score: vintageScore,
        max: 10.0,
        weight: '10%',
        years: Number(vintageYears.toFixed(1)),
        registrationDate: regDateStr || '01/07/2017'
      }
    },
    taxpayer,
    recentFilings: returns.slice(0, 8)
  };
}
