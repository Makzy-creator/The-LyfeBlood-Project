"use client";
import { CheckCircle2, Circle, Clock } from "lucide-react";

const REQUEST_ORDER = [
  "pending",
  "verified",
  "donor_matched",
  "checked_in",
  "blood_collected",
  "fulfilled",
];

function requestAtLeast(status, target) {
  const statusIndex = REQUEST_ORDER.indexOf(status);
  const targetIndex = REQUEST_ORDER.indexOf(target);
  return statusIndex >= targetIndex && targetIndex >= 0;
}

function hasAnyMatch(matches) {
  return (matches ?? []).length > 0;
}

function hasAcceptedMatch(matches, match) {
  return (
    match?.match_status === "Accepted" ||
    (matches ?? []).some((item) => item.match_status === "Accepted")
  );
}

function findActiveMatch(matches, match) {
  return (
    match ??
    (matches ?? []).find((item) => item.match_status === "Accepted") ??
    (matches ?? [])[0] ??
    null
  );
}

export function buildDonationJourney({ request, match, matches = [] }) {
  const activeMatch = findActiveMatch(matches, match);
  const requestStatus = request?.status ?? "pending";
  const matchingStatus = request?.matching_status ?? request?.matchingStatus ?? "pending";
  const donorAccepted = hasAcceptedMatch(matches, activeMatch);
  const rewardIssued =
    Boolean(request?.reward_issued_at) ||
    Boolean(activeMatch?.reward_issued_at) ||
    Boolean(activeMatch?.reward_issued) ||
    Boolean(activeMatch?.donation_completed_at) ||
    requestStatus === "fulfilled";

  return [
    {
      key: "request_created",
      label: "Request Created",
      done: Boolean(request?.id || request?.created_at || request?.requestDate),
    },
    {
      key: "donors_matched",
      label: "Donors Matched",
      done:
        hasAnyMatch(matches) ||
        ["matched", "sent", "accepted", "completed"].includes(matchingStatus) ||
        requestAtLeast(requestStatus, "donor_matched"),
    },
    {
      key: "donor_accepted",
      label: "Donor Accepted",
      done: donorAccepted || ["accepted", "completed"].includes(matchingStatus),
    },
    {
      key: "donor_traveling",
      label: "Donor Traveling",
      done: Boolean(activeMatch?.on_the_way_at),
    },
    {
      key: "donor_arrived",
      label: "Donor Arrived",
      done: Boolean(activeMatch?.arrived_at) || requestAtLeast(requestStatus, "checked_in"),
    },
    {
      key: "otp_verified",
      label: "OTP Verified",
      done: requestAtLeast(requestStatus, "checked_in"),
    },
    {
      key: "blood_collected",
      label: "Blood Collected",
      done: Boolean(activeMatch?.blood_collected_at) || requestAtLeast(requestStatus, "blood_collected"),
    },
    {
      key: "donation_confirmed",
      label: "Donation Confirmed",
      done: Boolean(activeMatch?.donation_completed_at) || requestStatus === "fulfilled",
    },
    {
      key: "reward_issued",
      label: "Reward Issued",
      done: rewardIssued,
    },
  ];
}

export default function DonationJourney({ request, match, matches = [] }) {
  const stages = buildDonationJourney({ request, match, matches });
  const completedCount = stages.filter((stage) => stage.done).length;
  const currentIndex = stages.findIndex((stage) => !stage.done);
  const activeIndex = currentIndex === -1 ? stages.length - 1 : currentIndex;
  const progress = Math.round((completedCount / stages.length) * 100);

  return (
    <section
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "8px",
        padding: "16px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0, fontSize: "15px", fontWeight: "800", color: "#1A1A1A" }}>
            Donation Journey
          </h2>
          <p style={{ margin: "2px 0 0", fontSize: "12px", color: "#6B6B6B" }}>
            {progress}% complete
          </p>
        </div>
        <span
          style={{
            backgroundColor: "#FADBD8",
            color: "#922B21",
            borderRadius: "999px",
            padding: "4px 9px",
            fontSize: "11px",
            fontWeight: "800",
            whiteSpace: "nowrap",
          }}
        >
          {stages[activeIndex]?.label}
        </span>
      </div>

      <div style={{ height: "8px", borderRadius: "999px", backgroundColor: "#F4F4F4", overflow: "hidden" }}>
        <div
          style={{
            width: `${progress}%`,
            height: "100%",
            backgroundColor: "#C0392B",
            borderRadius: "999px",
            transition: "width 200ms ease",
          }}
        />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {stages.map((stage, index) => {
          const isCurrent = index === activeIndex && !stage.done;
          const Icon = stage.done ? CheckCircle2 : isCurrent ? Clock : Circle;
          return (
            <div key={stage.key} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Icon
                size={18}
                color={stage.done ? "#1E8449" : isCurrent ? "#C0392B" : "#C8C8C8"}
                style={{ flexShrink: 0 }}
              />
              <span
                style={{
                  fontSize: "13px",
                  fontWeight: isCurrent || stage.done ? "800" : "600",
                  color: stage.done ? "#1A1A1A" : isCurrent ? "#922B21" : "#6B6B6B",
                }}
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
