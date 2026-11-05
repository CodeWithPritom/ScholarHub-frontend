/**
 * Lab Theme Tokens — Academic Beneto Aesthetic
 * Tailored for high-density academic workspaces, clarity, and visual elegance.
 */

export const labTheme = {
  colors: {
    bgApp: '#FAFAF8',         // Warm off-white page background
    bgCard: '#FFFFFF',        // Pure white card surfaces
    bgSubtle: '#F4F4F0',      // Soft interactive hover background
    bgMuted: '#EAEAE5',       // Disabled / secondary surface
    border: '#E5E5DF',        // Subtle academic border
    borderHover: '#D4D4CD',   // Hover border
    borderFocus: '#171717',   // Active keyboard/focus ring

    textPrimary: '#171717',   // Deep slate black typography
    textSecondary: '#525252', // Balanced secondary body text
    textMuted: '#737373',     // Subtle metadata, timestamps
    textSubtle: '#A3A3A3',    // Inactive placeholders

    primary: '#0F172A',       // Oxford slate navy (primary CTA)
    primaryHover: '#1E293B',
    accentIndigo: '#4F46E5',  // Research / AI accent
    accentEmerald: '#059669', // Verified / Published green
    accentAmber: '#D97706',   // In-progress / Alert amber
    accentCrimson: '#DC2626', // Warning / Deletion red
    accentSky: '#0284C7',     // Datasets / Files blue
  },

  shadows: {
    card: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)',
    dropdown: '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.04)',
    modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
  },

  classes: {
    card: 'bg-white border border-[#E5E5DF] rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)]',
    cardHover: 'hover:border-[#D4D4CD] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200',
    buttonPrimary: 'bg-[#0F172A] hover:bg-[#1E293B] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors shadow-sm inline-flex items-center justify-center gap-2',
    buttonSecondary: 'bg-white hover:bg-[#F4F4F0] text-[#171717] border border-[#E5E5DF] font-medium px-4 py-2 rounded-lg text-sm transition-colors inline-flex items-center justify-center gap-2',
    buttonGhost: 'hover:bg-[#F4F4F0] text-[#525252] hover:text-[#171717] px-3 py-2 rounded-lg text-sm transition-colors inline-flex items-center gap-2',
    badge: 'px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide inline-flex items-center gap-1',
    input: 'w-full bg-white border border-[#E5E5DF] rounded-lg px-3.5 py-2 text-sm text-[#171717] placeholder:text-[#A3A3A3] focus:outline-none focus:border-[#171717] focus:ring-1 focus:ring-[#171717] transition-all',
  }
};
