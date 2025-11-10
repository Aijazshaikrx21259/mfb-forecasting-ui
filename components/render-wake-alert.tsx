import { getRenderWakeHint, RENDER_API_DOCS_URL } from "@/lib/api-client";
import { Alert } from "@/components/ui/alert";

type RenderWakeAlertProps = {
  title?: string;
  description?: string;
  showDocsLink?: boolean;
};

const DEFAULT_TITLE = "Waking the forecasting API";

export function RenderWakeAlert({
  title = DEFAULT_TITLE,
  description = getRenderWakeHint(),
  showDocsLink = true,
}: RenderWakeAlertProps) {
  return (
    <Alert>
      <p className="font-semibold">{title}</p>
      <p className="text-sm leading-relaxed">
        {description}
        {showDocsLink ? (
          <>
            {" "}
            <a
              href={RENDER_API_DOCS_URL}
              target="_blank"
              rel="noreferrer"
              className="underline"
            >
              Open the API docs
            </a>{" "}
            to wake the backend, then refresh this page.
          </>
        ) : null}
      </p>
    </Alert>
  );
}
