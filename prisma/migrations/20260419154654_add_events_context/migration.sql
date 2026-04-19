-- CreateTable
CREATE TABLE "events_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "club_id" UUID NOT NULL,
    "title" VARCHAR(150) NOT NULL,
    "description" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL,
    "current_attendees" INTEGER NOT NULL DEFAULT 0,
    "version" INTEGER NOT NULL DEFAULT 1,
    "location" VARCHAR(200) NOT NULL,
    "latitude" DECIMAL(10,8),
    "longitude" DECIMAL(11,8),
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events_attendances" (
    "event_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "check_in_method" VARCHAR(50) NOT NULL,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "events_attendances_pkey" PRIMARY KEY ("event_id","user_id")
);

-- CreateTable
CREATE TABLE "events_tags" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "events_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events_event_tags" (
    "event_id" UUID NOT NULL,
    "tag_id" INTEGER NOT NULL,

    CONSTRAINT "events_event_tags_pkey" PRIMARY KEY ("event_id","tag_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "events_tags_name_key" ON "events_tags"("name");

-- AddForeignKey
ALTER TABLE "events_attendances" ADD CONSTRAINT "events_attendances_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_event_tags" ADD CONSTRAINT "events_event_tags_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events_events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events_event_tags" ADD CONSTRAINT "events_event_tags_tag_id_fkey" FOREIGN KEY ("tag_id") REFERENCES "events_tags"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
