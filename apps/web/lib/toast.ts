export type ToastTone = "success" | "error" | "info";

export type ToastPayload = {
  title: string;
  message?: string;
  tone?: ToastTone;
};

export function notify(payload: ToastPayload) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(
    new CustomEvent<ToastPayload>("mangaflux:toast", {
      detail: payload
    })
  );
}
