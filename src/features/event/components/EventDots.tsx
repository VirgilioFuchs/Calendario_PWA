import React from "react";
import {getDotColor} from "../../../shared/utils/eventHelpers";
import type { CalendarEvent } from "../../../shared/types";

export const DOT_SIZE = 7;
export const MAX_CAPSULE = 4;

interface EventCapsuleProps {
    events: CalendarEvent[];
}

const EventCapsule: React.FC<EventCapsuleProps> = ({ events }) => {
    const group = events.slice(0, MAX_CAPSULE);

    if (group.length === 0) return null;

    const height = DOT_SIZE;
    const totalWidth = DOT_SIZE * group.length;

    return (
        <span
            title={group
                .map((e) => e.feriado_titulo ?? e.feriado_tipo)
                .join(" · ")}
            className="inline-flex overflow-hidden shrink-0"
            style={{ width: totalWidth, height, borderRadius: height / 2 }}
        >
      {group.map((evt, i) => (
          <React.Fragment key={evt.feriado_id ?? `${evt.feriado_tipo}-${i}`}>
              {/* Segmento colorido — className direto do getDotColor */}
              <span className={`h-full flex-1 ${getDotColor(evt.feriado_tipo)}`} />
          </React.Fragment>
      ))}
    </span>
    );
};

export default EventCapsule;
