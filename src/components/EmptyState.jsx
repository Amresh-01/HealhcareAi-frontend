import {
  FileSearch,
  Calendar,
  Stethoscope,
  MessageSquare,
  Activity,
  ClipboardList,
  Users,
} from "lucide-react";

// 🔹 Reusable EmptyState Component
export function EmptyState({
  icon: Icon = FileSearch,
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div
      style={{
        border: "1px dashed #ccc",
        borderRadius: "10px",
        padding: "40px",
        textAlign: "center",
        marginTop: "20px",
      }}
    >
      <div style={{ marginBottom: "15px" }}>
        <Icon size={40} />
      </div>

      <h3>{title}</h3>
      <p style={{ fontSize: "14px", color: "#666" }}>{description}</p>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          style={{
            marginTop: "15px",
            padding: "10px 15px",
            cursor: "pointer",
            borderRadius: "5px",
            border: "none",
            background: "#007bff",
            color: "#fff",
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

// 🔹 Specific Empty States

export function NoSymptomChecksEmpty({ onAction }) {
  return (
    <EmptyState
      icon={Stethoscope}
      title="No Symptom Checks Yet"
      description="Start your first symptom check to get AI-powered health insights."
      actionLabel="Check Symptoms"
      onAction={onAction}
    />
  );
}

export function NoAppointmentsEmpty({ onAction }) {
  return (
    <EmptyState
      icon={Calendar}
      title="No Appointments Scheduled"
      description="Book an appointment with a doctor."
      actionLabel="Find a Doctor"
      onAction={onAction}
    />
  );
}

export function NoHealthDataEmpty({ onAction }) {
  return (
    <EmptyState
      icon={Activity}
      title="No Health Data Available"
      description="Add your health data to start tracking."
      actionLabel="Add Health Data"
      onAction={onAction}
    />
  );
}

export function NoDoctorsFoundEmpty({ onAction }) {
  return (
    <EmptyState
      icon={Users}
      title="No Doctors Found"
      description="Try changing your filters."
      actionLabel="Clear Filters"
      onAction={onAction}
    />
  );
}

export function NoChatHistoryEmpty({ onAction }) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="Start a Conversation"
      description="Chat with AI assistant for help."
      actionLabel="Start Chatting"
      onAction={onAction}
    />
  );
}

export function NoResultsEmpty({ onAction }) {
  return (
    <EmptyState
      icon={ClipboardList}
      title="No Results Yet"
      description="Enter symptoms to get analysis."
      actionLabel="Enter Symptoms"
      onAction={onAction}
    />
  );
}