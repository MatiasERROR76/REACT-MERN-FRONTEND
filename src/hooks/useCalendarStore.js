import { useDispatch, useSelector } from "react-redux";
import {
  onAddnewEvent,
  onDeleteEvent,
  onLoadEvents,
  onSetActiveEvent,
  onUpdateEvent,
} from "../store/calendar/calendarSlice";
import calendarApi from "../api/calendarApi";
import { convertDatesToEvents } from "../helpers/convertDatesToEvents";
import Swal from "sweetalert2";

export const useCalendarStore = () => {
  const dispatch = useDispatch();
  const { events, activeEvent } = useSelector((state) => state.calendar);
  const { user } = useSelector((state) => state.auth);

  const setActiveEvent = (calendarEvent) => {
    dispatch(onSetActiveEvent(calendarEvent));
  };

  const startSavingEvent = async (calendarEvent) => {
    try {
      if (calendarEvent.id) {
        // actualizando
        await calendarApi.put(`/events/${calendarEvent.id}`, calendarEvent);
        dispatch(onUpdateEvent({ ...calendarEvent, user }));

        return;
      }
      // creando

      const { data } = await calendarApi.post("/events/new", calendarEvent);

      dispatch(
        onAddnewEvent({
          ...calendarEvent,
          id: data.evento.id,
          user,
        })
      );
    } catch (error) {
      console.log(error);
      Swal.fire("Error al guardar", error.response.data.msg, "error");
    }
  };

  const startDeletingEvent = async (calendarEvent) => {
    // TODO: llegar al backend

    try {
      await calendarApi.delete(`events/${activeEvent.id}`);

      dispatch(onDeleteEvent());
      return;
    } catch (error) {
      console.log(error);
      Swal.fire("Error al eliminar", error.response.data.msg, "error");
    }
  };

  const startLoadingEvents = async () => {
    try {
      const { data } = await calendarApi.get("/events");
      const events = convertDatesToEvents(data.eventos);

      dispatch(onLoadEvents(events));
    } catch (error) {
      console.log("Error cargando eventos");
      console.log(error);
    }
  };
  return {
    // Props

    activeEvent,
    events,
    hasEventSelected: !!activeEvent,

    // métodos
    startLoadingEvents,
    setActiveEvent,
    startSavingEvent,
    startDeletingEvent,
  };
};
