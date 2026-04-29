"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, parseISO } from "date-fns";
import "react-day-picker/style.css";
import { formatMonthYear } from "@/lib/utils/formatters";
import { formatISODate } from "@/lib/utils/dates";

interface Props {
  roomSlug: string;
  roomName: string;
}

interface AvailabilityResponse {
  roomName: string;
  year: number;
  month: number;
  bookedDates: string[];
}

function toMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function shiftMonth(date: Date, offset: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + offset, 1);
}

export default function RoomAvailabilityCalendar({
  roomSlug,
  roomName,
}: Props) {
  const [month, setMonth] = useState(() => toMonthStart(new Date()));
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadAvailability() {
      try {
        setLoading(true);
        setError("");

        const year = month.getFullYear();
        const monthNumber = month.getMonth() + 1;
        const response = await fetch(
          `/api/rooms/${roomSlug}/availability?year=${year}&month=${monthNumber}`,
          { signal: controller.signal },
        );

        if (!response.ok) {
          const data = (await response.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(data?.error ?? "Failed to load availability");
        }

        const data = (await response.json()) as AvailabilityResponse;
        setBookedDates(data.bookedDates ?? []);
      } catch (err) {
        if (controller.signal.aborted) return;
        setBookedDates([]);
        setError(
          err instanceof Error ? err.message : "Failed to load availability",
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadAvailability();
    return () => controller.abort();
  }, [month, roomSlug]);

  const bookedDateKeys = new Set(bookedDates);
  const bookedDateValues = bookedDates.map((date) => parseISO(date));
  const selectedDateLabel = selectedDate
    ? format(parseISO(selectedDate), "MMMM d, yyyy")
    : "";

  function getMessage(dateLabel?: string) {
    return dateLabel
      ? `Hi! I'd like to book ${roomName} at ZEN House Calayo on ${dateLabel}.`
      : `Hi! I'd like to book ${roomName} at ZEN House Calayo.`;
  }

  function getMessengerHref(dateLabel?: string) {
    return `https://m.me/100075945187126?text=${encodeURIComponent(getMessage(dateLabel))}`;
  }

  function handleDayClick(date: Date) {
    if (
      date.getFullYear() !== month.getFullYear() ||
      date.getMonth() !== month.getMonth()
    )
      return;

    const dateKey = formatISODate(date);
    if (bookedDateKeys.has(dateKey)) return;

    setSelectedDate((current) => (current === dateKey ? "" : dateKey));
  }

  async function copyMessageToClipboard() {
    try {
      await navigator.clipboard.writeText(
        getMessage(selectedDateLabel || undefined),
      );
      setCopyFeedback(
        "Message copied. If Messenger opens empty, just paste it.",
      );
    } catch {
      setCopyFeedback(
        "Could not copy automatically, but the Messenger link will still open.",
      );
    }
  }

  async function handleBookNow(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    await copyMessageToClipboard();
    window.location.href = getMessengerHref(selectedDateLabel || undefined);
  }

  return (
    <section className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900">
            Availability Calendar
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Browse open and unavailable dates for {roomName}.
          </p>
        </div>

        <div className="flex items-center gap-4 self-center">
          <button
            type="button"
            onClick={() => setMonth((current) => shiftMonth(current, -1))}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-indigo-200 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            aria-label="Previous month"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="font-semibold text-gray-900 text-base sm:text-lg min-w-[170px] text-center">
            {formatMonthYear(month.getFullYear(), month.getMonth() + 1)}
          </span>
          <button
            type="button"
            onClick={() => setMonth((current) => shiftMonth(current, 1))}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-indigo-200 text-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
            aria-label="Next month"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex gap-4 text-sm text-gray-600 flex-wrap mt-4">
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-green-100 border border-green-200 inline-block" />
          Available
        </span>
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 rounded bg-red-200 border border-red-300 inline-block" />
          Unavailable
        </span>
      </div>

      <div className="mt-6 min-h-[320px]">
        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : loading ? (
          <div className="h-[320px] rounded-xl border border-gray-200 bg-gray-50 animate-pulse" />
        ) : (
          <>
            <DayPicker
              month={month}
              disableNavigation
              hideNavigation
              onDayClick={handleDayClick}
              modifiers={{
                available: (date) =>
                  date.getFullYear() === month.getFullYear() &&
                  date.getMonth() === month.getMonth() &&
                  !bookedDateKeys.has(formatISODate(date)),
                booked: bookedDateValues,
                selected: (date) => selectedDate === formatISODate(date),
              }}
              modifiersClassNames={{
                available: "rdp-day-available",
                booked: "rdp-day-booked",
                selected: "rdp-day-selected",
              }}
              styles={{
                root: { "--rdp-font-size": "0.95rem" } as CSSProperties,
              }}
            />
            <p className="text-sm text-gray-700 mt-4">
              {selectedDate
                ? `Selected date: ${selectedDateLabel}`
                : "Tap an available date to add it to your booking message."}
            </p>
            <p className="text-xs text-gray-500 mt-4">
              Dates marked unavailable already have an active booking for this
              room.
            </p>
          </>
        )}
      </div>

      <div className="bg-amber-50 rounded-xl p-6 mt-6">
        <h3 className="text-xl font-serif font-bold text-gray-900 mb-2">
          Interested in this room?
        </h3>
        <p className="text-gray-600 mb-4">
          {selectedDate
            ? `Your inquiry will include ${selectedDateLabel}.`
            : "Choose a green date above to include it in your inquiry, or message us without a date."}
        </p>
        <div className="flex gap-3 flex-wrap">
          <a
            href={getMessengerHref(selectedDateLabel || undefined)}
            onClick={handleBookNow}
            className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white font-medium rounded hover:bg-amber-600 transition-colors"
          >
            Book Now
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </a>
          {/* <button
            type="button"
            onClick={copyMessageToClipboard}
            className="inline-flex items-center gap-2 px-6 py-3 border border-amber-300 text-amber-700 font-medium rounded hover:bg-amber-100 transition-colors"
          >
            Copy Message
          </button> */}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Messenger sometimes ignores prefilled text, so we also provide the
          same message for quick paste.
        </p>
        {copyFeedback && (
          <p className="text-xs text-amber-700 mt-2">{copyFeedback}</p>
        )}
      </div>

      <style>{`
        .rdp-month_caption { display: none; }
        .rdp-day-available { background-color: #dcfce7; color: #166534; border-radius: 8px; cursor: pointer; }
        .rdp-day-booked { background-color: #fecaca; color: #991b1b; border-radius: 8px; font-weight: 600; }
        .rdp-day-selected { background-color: #f59e0b; color: white; border-radius: 8px; font-weight: 700; box-shadow: 0 0 0 2px rgba(180, 83, 9, 0.22); }
        .rdp-day-available.rdp-today { color: #166534; box-shadow: inset 0 0 0 2px rgba(15, 23, 42, 0.18); }
        .rdp-day-booked.rdp-today { color: #991b1b; box-shadow: inset 0 0 0 2px rgba(15, 23, 42, 0.18); }
        .rdp-day-selected.rdp-today { color: white; box-shadow: inset 0 0 0 2px rgba(15, 23, 42, 0.18); }
      `}</style>
    </section>
  );
}
