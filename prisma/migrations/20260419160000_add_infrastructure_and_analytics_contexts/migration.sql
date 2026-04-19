-- CreateTable
CREATE TABLE "infrastructure_outbox_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "aggregate_type" VARCHAR(50) NOT NULL,
    "aggregate_id" UUID NOT NULL,
    "event_type" VARCHAR(100) NOT NULL,
    "payload" JSONB NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "infrastructure_outbox_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_club_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "club_id" UUID NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "total_members" INTEGER NOT NULL,
    "active_members_count" INTEGER NOT NULL,
    "pending_applications" INTEGER NOT NULL,
    "total_events" INTEGER NOT NULL,
    "published_events" INTEGER NOT NULL,
    "completed_events" INTEGER NOT NULL,
    "total_attendances" INTEGER NOT NULL,
    "average_attendance_rate" DECIMAL(5,2) NOT NULL,
    "growth_rate" DECIMAL(5,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_club_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_event_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "event_id" UUID NOT NULL,
    "snapshot_date" DATE NOT NULL,
    "capacity" INTEGER NOT NULL,
    "total_attendees" INTEGER NOT NULL,
    "attendance_rate" DECIMAL(5,2) NOT NULL,
    "check_in_qr_count" INTEGER NOT NULL,
    "check_in_gps_count" INTEGER NOT NULL,
    "check_in_manual_count" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_event_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_global_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "snapshot_date" DATE NOT NULL,
    "total_users" INTEGER NOT NULL,
    "active_users" INTEGER NOT NULL,
    "total_clubs" INTEGER NOT NULL,
    "active_clubs" INTEGER NOT NULL,
    "total_events" INTEGER NOT NULL,
    "published_events" INTEGER NOT NULL,
    "total_attendances" INTEGER NOT NULL,
    "average_event_capacity" DECIMAL(8,2) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_global_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "infrastructure_outbox_events_published_created_at_idx" ON "infrastructure_outbox_events"("published", "created_at");

-- CreateIndex
CREATE INDEX "analytics_club_snapshots_club_id_snapshot_date_idx" ON "analytics_club_snapshots"("club_id", "snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_club_snapshots_club_id_snapshot_date_key" ON "analytics_club_snapshots"("club_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "analytics_event_snapshots_event_id_snapshot_date_idx" ON "analytics_event_snapshots"("event_id", "snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_event_snapshots_event_id_snapshot_date_key" ON "analytics_event_snapshots"("event_id", "snapshot_date");

-- CreateIndex
CREATE INDEX "analytics_global_snapshots_snapshot_date_idx" ON "analytics_global_snapshots"("snapshot_date");

-- CreateIndex
CREATE UNIQUE INDEX "analytics_global_snapshots_snapshot_date_key" ON "analytics_global_snapshots"("snapshot_date");
