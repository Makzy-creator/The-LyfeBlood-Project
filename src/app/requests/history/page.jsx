"use client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ClipboardList } from "lucide-react";
import TopAppBar from "@/components/ui/TopAppBar";
import BottomNavBar from "@/components/ui/BottomNavBar";
import RequestCard from "@/components/ui/RequestCard";
import { REQUEST_STATUS, useApp } from "@/context/AppContext";

const ROLE_HOME_ROUTE = {
  donor: "/donor/home",
  requester: "/dashboard",
  patient_family: "/dashboard",
  hospital: "/hospital/dashboard",
  hospital_officer: "/hospital/dashboard",
};

function isDonorRole(role) {
  return role === "donor";
}

export default function RequestHistoryPage() {
  const navigate = useNavigate();
  const {
    currentUser,
    isAuthenticated,
    bloodRequests,
    markAllNotificationsRead,
  } = useApp();

  useEffect(() => {
    if (!isAuthenticated) navigate("/login");
  }, [isAuthenticated, navigate]);

  if (!currentUser) return null;

  const donor = isDonorRole(currentUser.role);
  const homeRoute = ROLE_HOME_ROUTE[currentUser.role] ?? "/dashboard";
  const visibleRequests = donor
    ? bloodRequests.filter((request) => request.status !== REQUEST_STATUS.FULFILLED)
    : bloodRequests;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingBottom: "80px" }}>
        <TopAppBar
          title={donor ? "Available Requests" : "Request History"}
          onBellPress={markAllNotificationsRead}
        />
        <main style={{ padding: "16px 12px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            aria-label="Back"
            style={{
              width: "36px",
              height: "36px",
              border: "none",
              borderRadius: "8px",
              backgroundColor: "#F4F4F4",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <ChevronLeft size={20} color="#1A1A1A" />
          </button>

          <section
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "8px",
              padding: "16px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <ClipboardList size={22} color="#C0392B" />
            <div>
              <p style={{ margin: "0 0 2px", fontSize: "22px", fontWeight: "800", color: "#1A1A1A" }}>
                {visibleRequests.length}
              </p>
              <p style={{ margin: 0, fontSize: "12px", color: "#6B6B6B", fontWeight: "700" }}>
                {donor
                  ? `request${visibleRequests.length === 1 ? "" : "s"} available for your blood group`
                  : `request${visibleRequests.length === 1 ? "" : "s"} in history`}
              </p>
            </div>
          </section>

          {visibleRequests.length === 0 ? (
            <section
              style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: "32px 18px",
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                textAlign: "center",
              }}
            >
              <ClipboardList size={38} color="#C8C8C8" />
              <p style={{ margin: "10px 0 0", fontSize: "14px", fontWeight: "700", color: "#6B6B6B" }}>
                {donor ? "No compatible requests yet" : "No request history yet"}
              </p>
            </section>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {visibleRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onClick={donor ? undefined : () => navigate(`/requests/${request.id}`)}
                />
              ))}
            </div>
          )}
        </main>
      </div>
      <BottomNavBar
        onNavigate={(key) => {
          if (key === "home") navigate(homeRoute);
          if (key === "profile") navigate("/profile");
        }}
      />
    </>
  );
}
