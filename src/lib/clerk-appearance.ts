import { dark } from "@clerk/themes";

type SharkdeskAppearance = {
  baseTheme: typeof dark;
  variables: Record<string, string | number | undefined>;
  elements: Record<string, string | Record<string, string> | undefined>;
};

/** Shared Clerk UI — dark theme aligned with SharkDesk (sidebar, modals, User Profile, org switcher). */
export const sharkdeskClerkAppearance: SharkdeskAppearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#14B8A6",
    /** Light — Clerk uses this for text on primary *and* some accent labels; dark (#0B0F1A) read as “black” on navy. */
    colorPrimaryForeground: "#F9FAFB",
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
      "!text-[#0B0F1A] bg-gradient-to-r from-[#14B8A6] to-[#22D3EE] font-semibold shadow-[0_0_15px_rgba(20,184,166,0.25)]",
    formFieldInput:
      "border-[#1F2937] bg-[#0B0F1A] text-[#E5E7EB] focus:border-[#14B8A6]/50",
    identityPreview: "border-[#1F2937] bg-[#0B0F1A]",
    identityPreviewText: "text-[#E5E7EB]",
    identityPreviewEditButton: "text-[#14B8A6]",
    navbar: "border-b border-[#1F2937] bg-[#121826]",
    navbarButton: "text-[#E5E7EB] hover:bg-[#1a2235]",
    profileSectionTitle: "text-[#9CA3AF]",
    profileSectionContent: "text-[#E5E7EB]",
    organizationSwitcherPopoverCard:
      "border border-[#1F2937] bg-[#121826] text-[#E5E7EB] shadow-2xl rounded-xl overflow-hidden",
    organizationSwitcherPopoverMain: "bg-[#121826] text-[#E5E7EB]",
    organizationPreviewMainIdentifier:
      "!text-[#F9FAFB] font-semibold",
    organizationPreviewSecondaryIdentifier: "!text-[#9CA3AF]",
    organizationSwitcherPopoverFooter: "hidden",
    organizationSwitcherPopoverActionButton:
      "!text-[#E5E7EB] hover:bg-[#1a2235] hover:!text-white",
    organizationSwitcherPopoverActionButtonIcon: "!text-[#9CA3AF]",
    organizationSwitcherPopoverActionButtonText: "!text-[#E5E7EB]",
    organizationSwitcherPopoverInvitationActions:
      "border-t border-[#1F2937] bg-[#0B0F1A]/60 !text-[#9CA3AF]",
    organizationSwitcherListedOrganization:
      "rounded-lg hover:bg-[#1a2235] border-transparent",
    organizationSwitcherListedOrganizationAvatarContainer:
      "border border-[#1F2937]",
  },
};

/** Deep-merge appearance overrides (Team page triggers, etc.). */
export function mergeSharkdeskAppearance(
  partial?: Partial<SharkdeskAppearance> | null,
): SharkdeskAppearance {
  return {
    ...sharkdeskClerkAppearance,
    ...partial,
    baseTheme: partial?.baseTheme ?? sharkdeskClerkAppearance.baseTheme,
    variables: {
      ...sharkdeskClerkAppearance.variables,
      ...partial?.variables,
    },
    elements: {
      ...sharkdeskClerkAppearance.elements,
      ...partial?.elements,
    },
  };
}
