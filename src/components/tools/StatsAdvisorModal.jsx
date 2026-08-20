import React, { useState, useMemo } from 'react'
import {
  Calculator, Check, Copy, Sliders, ArrowRight, HelpCircle,
  FileCode, BookOpen, AlertCircle, X, Sparkles, CheckCircle2, ChevronRight
} from 'lucide-react'
import { toast } from 'sonner'

export const StatsAdvisorModal = ({ isOpen, onClose }) => {
  const [goal, setGoal] = useState('compare_means') // compare_means, correlation, regression, survival, categorical
  const [groups, setGroups] = useState('2_independent') // 2_independent, 2_paired, 3_independent, 3_repeated
  const [distribution, setDistribution] = useState('parametric') // parametric, non_parametric
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedAPA, setCopiedAPA] = useState(false)
  const [activeCodeTab, setActiveCodeTab] = useState('python') // python, r

  const decision = useMemo(() => {
    if (goal === 'compare_means') {
      if (groups === '2_independent') {
        if (distribution === 'parametric') {
          return {
            title: "Two-Sample Independent Student's t-Test",
            subtitle: "Compares means of two unrelated, normally distributed groups.",
            altTitle: "Welch's t-test (if variances are unequal) or Mann-Whitney U test (if non-normal).",
            assumptions: [
              "Continuous scale of measurement",
              "Independent observations (no paired subjects)",
              "Normal distribution in each group (Shapiro-Wilk p > .05)",
              "Homogeneity of variance (Levene's test p > .05; use Welch's t-test if violated)"
            ],
            nullHypothesis: "H₀: μ₁ = μ₂ (The two population means are equal)",
            pythonCode: `import scipy.stats as stats\n\n# Independent Two-Sample t-Test\nt_stat, p_val = stats.ttest_ind(group1_data, group2_data, equal_var=True)\nprint(f"t-statistic: {t_stat:.3f}, p-value: {p_val:.4f}")`,
            rCode: `# Two-Sample t-Test\nt.test(group1_data, group2_data, var.equal = TRUE)`,
            apaTemplate: `An independent-samples t-test was conducted to compare [Outcome] between [Group 1] and [Group 2]. There was a statistically significant difference in scores for [Group 1] (M = [M1], SD = [SD1]) and [Group 2] (M = [M2], SD = [SD2]); t([df]) = [t-val], p = [p-val], d = [Cohen's d].`
          }
        } else {
          return {
            title: "Mann-Whitney U Test (Wilcoxon Rank-Sum Test)",
            subtitle: "Non-parametric comparison of medians/ranks between two independent groups.",
            altTitle: "Independent Student's t-test (if data is transformed to normality).",
            assumptions: [
              "Continuous or ordinal dependent variable",
              "Independent observations",
              "Non-normal distribution or small sample size (N < 20 per group)",
              "Similar distribution shapes for interpreting median differences"
            ],
            nullHypothesis: "H₀: P(X > Y) = P(Y > X) (The distributions of both populations are identical)",
            pythonCode: `import scipy.stats as stats\n\n# Mann-Whitney U Test\nu_stat, p_val = stats.mannwhitneyu(group1_data, group2_data, alternative='two-sided')\nprint(f"U-statistic: {u_stat:.3f}, p-value: {p_val:.4f}")`,
            rCode: `# Mann-Whitney U Test (Wilcoxon Rank-Sum)\nwilcox.test(group1_data, group2_data, exact = FALSE)`,
            apaTemplate: `A Mann-Whitney U test indicated that [Outcome] was significantly greater for [Group 1] (Mdn = [Mdn1], IQR = [IQR1]) than for [Group 2] (Mdn = [Mdn2], IQR = [IQR2]), U = [U-val], z = [z-val], p = [p-val], r = [effect size r].`
          }
        }
      } else if (groups === '2_paired') {
        if (distribution === 'parametric') {
          return {
            title: "Paired Samples t-Test (Repeated Measures)",
            subtitle: "Compares means of two related observations on the same subjects (e.g. Pre- vs Post-treatment).",
            altTitle: "Wilcoxon Signed-Rank Test (if difference scores are non-normal).",
            assumptions: [
              "Paired/Matched continuous data from identical subjects",
              "Differences between pairs are normally distributed",
              "Independence across different subjects"
            ],
            nullHypothesis: "H₀: μ_diff = 0 (Mean difference between paired conditions is zero)",
            pythonCode: `import scipy.stats as stats\n\n# Paired t-Test\nt_stat, p_val = stats.ttest_rel(pre_data, post_data)\nprint(f"Paired t: {t_stat:.3f}, p-value: {p_val:.4f}")`,
            rCode: `# Paired t-Test\nt.test(post_data, pre_data, paired = TRUE)`,
            apaTemplate: `A paired-samples t-test was conducted to evaluate the impact of [Intervention] on [Outcome]. There was a statistically significant increase/decrease from pre-test (M = [M1], SD = [SD1]) to post-test (M = [M2], SD = [SD2]), t([df]) = [t-val], p = [p-val], d_z = [Cohen's d_z].`
          }
        } else {
          return {
            title: "Wilcoxon Signed-Rank Test",
            subtitle: "Non-parametric alternative for paired/repeated measures on ordinal or skewed data.",
            altTitle: "Sign test (if symmetry assumption is violated).",
            assumptions: [
              "Paired dependent data",
              "Symmetrical distribution of difference scores",
              "Ordinal or skewed continuous variables"
            ],
            nullHypothesis: "H₀: Median difference between paired pairs is zero",
            pythonCode: `import scipy.stats as stats\n\n# Wilcoxon Signed-Rank Test\nw_stat, p_val = stats.wilcoxon(pre_data, post_data)\nprint(f"Wilcoxon W: {w_stat:.3f}, p-value: {p_val:.4f}")`,
            rCode: `# Wilcoxon Signed-Rank Test\nwilcox.test(post_data, pre_data, paired = TRUE)`,
            apaTemplate: `A Wilcoxon signed-rank test revealed that [Intervention] elicited a statistically significant change in [Outcome] (Mdn_post = [Mdn2] vs Mdn_pre = [Mdn1]), W = [W-val], z = [z-val], p = [p-val], r = [r].`
          }
        }
      } else if (groups === '3_independent') {
        if (distribution === 'parametric') {
          return {
            title: "One-Way ANOVA with Tukey's HSD Post-Hoc Test",
            subtitle: "Compares means across three or more independent categorical groups.",
            altTitle: "Welch's ANOVA (if heteroscedastic) or Kruskal-Wallis (if non-normal).",
            assumptions: [
              "Continuous dependent variable",
              "Categorical independent factor with ≥ 3 levels",
              "Normality of residuals across groups",
              "Homogeneity of variance (Levene's test p > .05)"
            ],
            nullHypothesis: "H₀: μ₁ = μ₂ = μ₃ ... = μ_k (All group population means are equal)",
            pythonCode: `import scipy.stats as stats\nfrom statsmodels.stats.multicomp import pairwise_tukeyhsd\n\n# 1. One-Way ANOVA\nf_stat, p_val = stats.f_oneway(group1, group2, group3)\nprint(f"ANOVA F: {f_stat:.3f}, p-value: {p_val:.4f}")\n\n# 2. Tukey Post-Hoc\ntukey = pairwise_tukeyhsd(endog=all_data, groups=group_labels, alpha=0.05)\nprint(tukey)`,
            rCode: `# One-Way ANOVA & Tukey HSD\nfit <- aov(outcome ~ group, data = df)\nsummary(fit)\nTukeyHSD(fit)`,
            apaTemplate: `A one-way between-groups ANOVA was conducted to explore the impact of [Treatment] on [Outcome]. There was a statistically significant difference at the p < .05 level across groups: F([df1], [df2]) = [F-val], p = [p-val], η_p² = [eta_sq]. Post-hoc comparisons using Tukey's HSD test indicated that the mean score for [Group 1] (M = [M1], SD = [SD1]) was significantly different from [Group 2] (M = [M2], SD = [SD2]).`
          }
        } else {
          return {
            title: "Kruskal-Wallis H Test with Dunn's Post-Hoc Test",
            subtitle: "Non-parametric comparison across 3+ independent groups without normality assumption.",
            altTitle: "One-way ANOVA (if log-transformed to meet normality).",
            assumptions: [
              "Ordinal or continuous dependent variable",
              "Three or more independent groups",
              "Non-normal distributions"
            ],
            nullHypothesis: "H₀: The mean ranks of the groups are equal across all populations",
            pythonCode: `import scipy.stats as stats\nimport scikit_posthocs as sp\n\n# 1. Kruskal-Wallis Test\nh_stat, p_val = stats.kruskal(group1, group2, group3)\nprint(f"H-statistic: {h_stat:.3f}, p-value: {p_val:.4f}")\n\n# 2. Dunn's Post-Hoc with Bonferroni correction\ndunn = sp.posthoc_dunn([group1, group2, group3], p_adjust='bonferroni')\nprint(dunn)`,
            rCode: `# Kruskal-Wallis & Dunn's Test\nkruskal.test(outcome ~ group, data = df)\nlibrary(dunn.test)\ndunn.test(df$outcome, df$group, method = "bonferroni")`,
            apaTemplate: `A Kruskal-Wallis test showed that there was a statistically significant difference in [Outcome] between the different [Group levels], H([df]) = [H-val], p = [p-val], with a mean rank score of [Rank1] for [Group 1], [Rank2] for [Group 2], and [Rank3] for [Group 3]. Dunn's post-hoc pairwise tests with Bonferroni correction showed...`
          }
        }
      } else {
        return {
          title: "Repeated Measures ANOVA (or Friedman Test)",
          subtitle: "Evaluates changes across 3 or more related timepoints/conditions in the same subjects.",
          altTitle: "Friedman Test (non-parametric repeated measures).",
          assumptions: [
            "Continuous dependent variable measured across ≥ 3 timepoints",
            "Sphericity assumption (Mauchly's test p > .05; use Greenhouse-Geisser if violated)",
            "Normally distributed residuals"
          ],
          nullHypothesis: "H₀: μ_time1 = μ_time2 = μ_time3 (Means across repeated timepoints are identical)",
          pythonCode: `from statsmodels.stats.anova import AnovaRM\n\n# Repeated Measures ANOVA\nrm_anova = AnovaRM(data=df, depvar='outcome', subject='subject_id', within=['time'])\nres = rm_anova.fit()\nprint(res.summary())`,
          rCode: `# Repeated Measures ANOVA\nlibrary(ez)\nezANOVA(data = df, dv = outcome, wid = subject_id, within = time, type = 3)`,
          apaTemplate: `A repeated-measures ANOVA was conducted with [Time (Baseline, Month 1, Month 3)] as the within-subjects factor. Results revealed a statistically significant main effect of time on [Outcome], F([df1], [df2]) = [F-val], p = [p-val], η_p² = [eta_sq].`
        }
      }
    } else if (goal === 'correlation') {
      if (distribution === 'parametric') {
        return {
          title: "Pearson Product-Moment Correlation (r)",
          subtitle: "Measures linear association strength and direction between two continuous variables.",
          altTitle: "Spearman's rank correlation (if monotonic non-linear or skewed).",
          assumptions: [
            "Both variables continuous on interval/ratio scale",
            "Linear relationship verified on scatter plot",
            "Bivariate normal distribution",
            "No extreme multivariate outliers"
          ],
          nullHypothesis: "H₀: ρ = 0 (No linear correlation in the population)",
          pythonCode: `import scipy.stats as stats\n\n# Pearson Correlation\nr, p_val = stats.pearsonr(var1_data, var2_data)\nprint(f"Pearson r: {r:.3f}, p-value: {p_val:.4f}")`,
          rCode: `# Pearson Correlation\ncor.test(df$var1, df$var2, method = "pearson")`,
          apaTemplate: `A Pearson correlation coefficient was computed to assess the linear relationship between [Variable 1] and [Variable 2]. There was a significant positive/negative correlation between the two variables, r([N-2]) = [r-val], p = [p-val], 95% CI [[lower], [upper]].`
        }
      } else {
        return {
          title: "Spearman's Rank-Order Correlation (r_s / rho)",
          subtitle: "Non-parametric monotonic association between ranked, ordinal, or skewed continuous variables.",
          altTitle: "Kendall's Tau (preferred for small sample sizes with many tied ranks).",
          assumptions: [
            "Continuous or ordinal variables",
            "Monotonic relationship (as X increases, Y consistently increases/decreases)"
          ],
          nullHypothesis: "H₀: ρ_s = 0 (No monotonic association between variables)",
          pythonCode: `import scipy.stats as stats\n\n# Spearman Correlation\nrho, p_val = stats.spearmanr(var1_data, var2_data)\nprint(f"Spearman rho: {rho:.3f}, p-value: {p_val:.4f}")`,
          rCode: `# Spearman Rank Correlation\ncor.test(df$var1, df$var2, method = "spearman")`,
          apaTemplate: `A Spearman rank-order correlation was run to assess the relationship between [Variable 1] and [Variable 2]. There was a statistically significant monotonic relationship between [Variable 1] and [Variable 2], r_s([N-2]) = [rho-val], p = [p-val].`
        }
      }
    } else if (goal === 'regression') {
      return {
        title: "Multiple Linear & Logistic Regression Analysis",
        subtitle: "Models relationship between one or more predictors (X) and an outcome (Y).",
        altTitle: "Ordinary Least Squares (OLS) for continuous Y, Binary Logistic Regression for dichotomous Y.",
        assumptions: [
          "Linearity of relationship between predictors and continuous outcome",
          "Homoscedasticity of residuals (Breusch-Pagan test p > .05)",
          "No severe multicollinearity (VIF < 5 for all predictors)",
          "Independence of residuals (Durbin-Watson d ≈ 2.0)"
        ],
        nullHypothesis: "H₀: β₁ = β₂ = ... = β_k = 0 (Predictors explain 0% variance in the outcome)",
        pythonCode: `import statsmodels.api as sm\n\n# Multiple OLS Regression\nX = sm.add_constant(df[['predictor1', 'predictor2', 'predictor3']])\ny = df['outcome']\nmodel = sm.OLS(y, X).fit()\nprint(model.summary())`,
        rCode: `# Multiple Linear Regression\nmodel <- lm(outcome ~ predictor1 + predictor2 + predictor3, data = df)\nsummary(model)`,
        apaTemplate: `Multiple linear regression was calculated to predict [Outcome] based on [Predictor 1], [Predictor 2], and [Predictor 3]. A significant regression equation was found (F([df1], [df2]) = [F-val], p < .001), with an R² of [R2]. [Predictor 1] significantly predicted outcome (β = [beta], t = [t-val], p = [p-val]).`
      }
    } else if (goal === 'survival') {
      return {
        title: "Kaplan-Meier Survival Analysis & Cox Proportional Hazards Model",
        subtitle: "Analyzes time-to-event data with censoring (e.g. disease-free survival, device failure time).",
        altTitle: "Log-Rank Test (for group comparisons), Cox Model (for covariate adjustments).",
        assumptions: [
          "Censoring is non-informative (unrelated to probability of event occurrence)",
          "Survival probabilities are consistent across recruitment periods",
          "Proportional hazards assumption (hazard ratio remains constant over time; Schoenfeld residuals p > .05)"
        ],
        nullHypothesis: "H₀: HR = 1.0 (No difference in event rate / hazard between cohorts)",
        pythonCode: `from lifelines import KaplanMeierFitter, CoxPHFitter\n\n# 1. Kaplan-Meier\nkmf = KaplanMeierFitter()\nkmf.fit(durations=df['time'], event_observed=df['event'])\n\n# 2. Cox Proportional Hazards\ncph = CoxPHFitter()\ncph.fit(df[['time', 'event', 'treatment', 'age']], duration_col='time', event_col='event')\ncph.print_summary()`,
        rCode: `# Survival Analysis in R\nlibrary(survival)\nsurv_obj <- Surv(time = df$time, event = df$event)\nfit <- survfit(surv_obj ~ treatment, data = df)\ncox_fit <- coxph(surv_obj ~ treatment + age, data = df)\nsummary(cox_fit)`,
        apaTemplate: `A Kaplan-Meier survival analysis with log-rank test demonstrated a statistically significant survival advantage for [Treatment Cohort] (Median Survival = [T1] months) compared to [Control] (Median Survival = [T2] months), χ²([df]) = [chi_sq], p = [p-val]. In a multivariable Cox model, [Treatment] was associated with a [HR]% reduction in risk of event (HR = [HR-val], 95% CI [[lower], [upper]], p = [p-val]).`
      }
    } else {
      return {
        title: "Pearson's Chi-Square Test of Independence (χ²)",
        subtitle: "Determines association between two categorical variables (e.g., Treatment Response × Genotype).",
        altTitle: "Fisher's Exact Test (mandatory if any expected contingency cell count < 5).",
        assumptions: [
          "Both variables are mutually exclusive categorical variables",
          "Adequate expected cell frequencies: No cell has expected frequency < 1, and ≤ 20% of cells have expected frequency < 5",
          "Independent observations"
        ],
        nullHypothesis: "H₀: Variable A and Variable B are statistically independent",
        pythonCode: `import scipy.stats as stats\n\n# Chi-Square Test of Independence\ncontingency_table = [[40, 10], [20, 30]]\nchi2, p_val, dof, expected = stats.chi2_contingency(contingency_table)\nprint(f"Chi-square: {chi2:.3f}, p-value: {p_val:.4f}, df: {dof}")`,
        rCode: `# Chi-Square Test\nchisq.test(table(df$var_a, df$var_b))`,
        apaTemplate: `A chi-square test of independence was performed to examine the relation between [Variable A] and [Variable B]. The relation between these variables was significant, χ²([df], N = [N]) = [chi2_val], p = [p-val], Cramér's V = [V-val].`
      }
    }
  }, [goal, groups, distribution])

  if (!isOpen) return null

  const handleCopyCode = () => {
    const code = activeCodeTab === 'python' ? decision.pythonCode : decision.rCode
    navigator.clipboard.writeText(code)
    setCopiedCode(true)
    toast.success(`${activeCodeTab.toUpperCase()} code copied!`)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyAPA = () => {
    navigator.clipboard.writeText(decision.apaTemplate)
    setCopiedAPA(true)
    toast.success('APA 7th reporting template copied!')
    setTimeout(() => setCopiedAPA(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* ─── Header ─── */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-500/20 shrink-0">
              <Calculator size={20} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-200 text-[10px] font-black uppercase tracking-wider text-indigo-700 mb-0.5">
                <Sparkles size={11} /> Statistical Advisory & Biostatistics Engine (Skill #6)
              </div>
              <h3 className="text-base font-black text-slate-900 leading-tight">
                Statistical Test Selector & APA 7th Reporter
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Decide exact parametric vs non-parametric hypotheses tests, assumptions & reporting syntax
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* ─── Body Scrollable ─── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-200">
          
          {/* Step 1: Research Goal */}
          <div className="space-y-2">
            <label className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[11px] font-black flex items-center justify-center">1</span>
              <span>Primary Research Objective & Variable Architecture</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'compare_means', label: 'Group Means / Differences', desc: 't-test, ANOVA' },
                { id: 'correlation', label: 'Correlation & Association', desc: 'Pearson, Spearman' },
                { id: 'regression', label: 'Prediction & Modeling', desc: 'OLS, Logistic' },
                { id: 'survival', label: 'Survival & Hazard', desc: 'Kaplan-Meier, Cox' },
                { id: 'categorical', label: 'Proportions / Frequencies', desc: 'Chi-Square, Fisher' }
              ].map(g => (
                <button
                  key={g.id}
                  onClick={() => setGoal(g.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    goal === g.id
                      ? 'bg-indigo-50/80 border-indigo-400 text-indigo-950 shadow-xs ring-1 ring-indigo-400'
                      : 'bg-slate-50/80 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="text-xs font-extrabold block leading-tight">{g.label}</span>
                  <span className="text-[10px] font-medium text-slate-500 mt-1 block">{g.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Grouping & Distribution Parameters */}
          {goal === 'compare_means' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Number of Groups & Study Design
                </label>
                <select
                  value={groups}
                  onChange={(e) => setGroups(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="2_independent">2 Independent Groups (e.g. Treatment vs Control)</option>
                  <option value="2_paired">2 Paired / Matched Groups (e.g. Pre vs Post Test)</option>
                  <option value="3_independent">3+ Independent Groups (e.g. Dose A vs B vs C)</option>
                  <option value="3_repeated">3+ Repeated Measures (e.g. Baseline, 1mo, 3mo)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                  Data Distribution & Sample Rigor
                </label>
                <select
                  value={distribution}
                  onChange={(e) => setDistribution(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
                >
                  <option value="parametric">Normally Distributed (Parametric / N ≥ 30)</option>
                  <option value="non_parametric">Skewed / Non-Normal / Small Sample (Non-Parametric)</option>
                </select>
              </div>
            </div>
          )}

          {goal === 'correlation' && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1.5">
              <label className="text-[11px] font-black uppercase tracking-wider text-slate-700">
                Relationship Linearity & Distribution
              </label>
              <select
                value={distribution}
                onChange={(e) => setDistribution(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
              >
                <option value="parametric">Linear & Bivariate Normal (Pearson r)</option>
                <option value="non_parametric">Monotonic Non-Linear or Ranked/Ordinal (Spearman rho)</option>
              </select>
            </div>
          )}

          {/* ─── Recommendation Card ─── */}
          <div className="p-5 bg-gradient-to-r from-indigo-900 to-slate-900 text-white rounded-3xl shadow-xl space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/40 text-[10px] font-black uppercase tracking-wider text-indigo-300">
                <CheckCircle2 size={12} className="text-emerald-400" /> Recommended Statistical Test
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                Significance Threshold: α = 0.05
              </span>
            </div>

            <h4 className="text-xl font-black text-white leading-snug">
              {decision.title}
            </h4>
            <p className="text-xs text-indigo-200/90 font-medium">
              {decision.subtitle}
            </p>

            <div className="pt-2 border-t border-white/10 text-xs text-slate-300 flex items-center gap-2 font-medium">
              <strong className="text-indigo-300">Null Hypothesis:</strong>
              <span className="font-mono bg-black/30 px-2 py-0.5 rounded-md text-[11px]">{decision.nullHypothesis}</span>
            </div>
          </div>

          {/* Key Assumptions Checklist */}
          <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
              <BookOpen size={14} className="text-indigo-600" /> Mandatory Assumptions & Diagnostic Checklist
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {decision.assumptions.map((ass, i) => (
                <div key={i} className="p-2.5 bg-slate-50 rounded-xl text-xs font-medium text-slate-700 flex items-start gap-2 border border-slate-200/60">
                  <span className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">✓</span>
                  <span>{ass}</span>
                </div>
              ))}
            </div>
          </div>

          {/* APA 7th Reporting Template Card */}
          <div className="p-4 bg-indigo-50/40 border border-indigo-100 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-black uppercase tracking-wider text-indigo-900 flex items-center gap-1.5">
                <Sparkles size={13} className="text-indigo-600" /> Publication-Ready APA 7th Edition Reporting Template
              </h5>
              <button
                onClick={handleCopyAPA}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedAPA ? <Check size={12} /> : <Copy size={12} />}
                <span>{copiedAPA ? 'Copied Template' : 'Copy Template'}</span>
              </button>
            </div>
            <div className="p-3.5 bg-white border border-indigo-200/80 rounded-xl text-xs font-medium text-slate-900 leading-relaxed font-sans">
              {decision.apaTemplate}
            </div>
          </div>

          {/* Executable Code Snippets */}
          <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <FileCode size={15} className="text-indigo-400" />
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveCodeTab('python')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeCodeTab === 'python' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Python (SciPy / Statsmodels)
                  </button>
                  <button
                    onClick={() => setActiveCodeTab('r')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeCodeTab === 'r' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    R Statistical Script
                  </button>
                </div>
              </div>

              <button
                onClick={handleCopyCode}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
              >
                {copiedCode ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            <pre className="text-xs font-mono text-emerald-300 p-2 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {activeCodeTab === 'python' ? decision.pythonCode : decision.rCode}
            </pre>
          </div>

        </div>

        {/* ─── Footer Controls ─── */}
        <div className="p-4 sm:p-6 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] font-bold text-slate-500">
            Compliant with ICMJE, APA 7th Edition & Nature Methods Statistical Guidelines
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
