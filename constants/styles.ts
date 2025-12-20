// Common CSS class constants for consistent styling across the application

export const COMMON_STYLES = {
  // Modal styles
  MODAL_BACKDROP: "fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4",
  MODAL_CONTAINER: "bg-white rounded-lg shadow-2xl w-full max-w-md",
  MODAL_HEADER: "flex justify-between items-center p-4 border-b border-slate-200",
  MODAL_TITLE: "text-xl font-semibold",
  MODAL_CLOSE_BUTTON: "text-slate-400 hover:text-slate-600",
  MODAL_CONTENT: "p-6 space-y-4",
  MODAL_FOOTER: "bg-slate-50 p-4 flex justify-end space-x-2 rounded-b-lg",

  // Form styles
  FORM_LABEL: "block text-sm font-medium text-slate-700",
  FORM_INPUT: "mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500",
  FORM_SELECT: "mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500",
  FORM_TEXTAREA: "mt-1 block w-full border border-slate-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500",
  FORM_CHECKBOX: "h-4 w-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500",

  // Button styles
  BUTTON_PRIMARY: "bg-primary-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
  BUTTON_SECONDARY: "bg-white py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500",
  BUTTON_DANGER: "bg-red-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500",

  // Layout styles
  PAGE_CONTAINER: "bg-slate-50 min-h-screen font-sans",
  CONTENT_CONTAINER: "flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto",
  CARD: "bg-white rounded-lg shadow-sm border border-slate-200",
  CARD_HEADER: "p-6 border-b border-slate-200",
  CARD_CONTENT: "p-6",

  // Text styles
  HEADING_1: "text-2xl font-bold text-slate-900",
  HEADING_2: "text-xl font-semibold text-slate-800",
  HEADING_3: "text-lg font-medium text-slate-700",
  TEXT_BODY: "text-slate-600",
  TEXT_MUTED: "text-slate-500 text-sm",
  TEXT_ERROR: "text-red-500 text-xs mt-1",

  // Status styles
  STATUS_SUCCESS: "text-green-600",
  STATUS_ERROR: "text-red-600",
  STATUS_WARNING: "text-yellow-600",
  STATUS_INFO: "text-blue-600",
} as const;

export const ANIMATION_STYLES = `
  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .fade-in-up {
    animation: fadeInUp 0.6s ease-out forwards;
  }
  .fade-in {
    animation: fadeIn 0.5s ease-out forwards;
  }
`;
