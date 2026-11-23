export type CommunityKind = "both" | "image" | "review";
export type CommunityPublicationKind = "image" | "review";

type CommunityPublicationState = {
  status?: string;
  publicationConsent?: boolean;
  imageRightsConfirmed?: boolean;
};

export function communitySubmissionGaps(input: {
  name: string;
  text: string;
  kind: CommunityKind;
  hasFile: boolean;
  submissionAcknowledged: boolean;
}) {
  const gaps: string[] = [];
  if (input.name.trim().length < 2) gaps.push("Name");
  if (input.kind !== "image" && input.text.trim().length < 4) gaps.push("Text");
  if (input.kind !== "review" && !input.hasFile) gaps.push("Bild");
  if (!input.submissionAcknowledged) gaps.push("Bestätigung zur Prüfung");
  return gaps;
}

export function canPublishCommunityItem(
  item: CommunityPublicationState,
  kind: CommunityPublicationKind,
) {
  return (
    item.publicationConsent === true && (kind !== "image" || item.imageRightsConfirmed === true)
  );
}

export function canShowCommunityItem(
  item: CommunityPublicationState,
  kind: CommunityPublicationKind,
) {
  return (
    item.status === "approved" &&
    item.publicationConsent === true &&
    (kind !== "image" || item.imageRightsConfirmed === true)
  );
}
