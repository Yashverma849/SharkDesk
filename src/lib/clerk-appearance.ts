import { dark } from "@clerk/themes";

/** Shared Clerk UI — dark theme aligned with SharkDesk (sidebar, modals, User Profile). */
export const sharkdeskClerkAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#14B8A6",
    colorPrimaryForeground: "#0B0F1A",
    colorForeground: "#E5E7EB",
    colorMutedForeground: "#9CA3AF",
    colorBackground: "#121826",
    colorInput: "#0B0F1A",
    colorInputForeground: "#E5E7EB",
    borderRadius: "0.75rem",
  },
  elements: {
    userProfilePage__phoneNumbers: {
      display: "none",
    },
    card: "border border-[#1F2937] bg-[#121826] shadow-2xl",
    modalBackdrop: "backdrop-blur-sm bg-black/60",
    modalContent: "border border-[#1F2937] bg-[#121826]",
    modalCloseButton: "text-[#9CA3AF] hover:text-white",
    footer: "hidden",
    footerPages: "hidden",
    badge: "bg-[#14B8A6]/15 text-[#14B8A6] border-[#14B8A6]/30",
    formButtonPrimary:
      "bg-gradient-to-r from-[#14B8A6] to-[#22D3EE] text-[#0B0F1A] font-semibold shadow-[0_0_15px_rgba(20,184,166,0.25)]",
    formFieldInput:
      "border-[#1F2937] bg-[#0B0F1A] text-[#E5E7EB] focus:border-[#14B8A6]/50",
    identityPreview: "border-[#1F2937] bg-[#0B0F1A]",
    identityPreviewText: "text-[#E5E7EB]",
    identityPreviewEditButton: "text-[#14B8A6]",
    navbar: "border-b border-[#1F2937] bg-[#121826]",
    navbarButton: "text-[#E5E7EB] hover:bg-[#1a2235]",
    profileSectionTitle: "text-[#9CA3AF]",
    profileSectionContent: "text-[#E5E7EB]",
  },
};
