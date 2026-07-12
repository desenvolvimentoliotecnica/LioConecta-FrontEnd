import { useEffect, useRef, useState } from "react";
import {
  useUniLioScormRuntime,
  useUniLioScormRuntimeUpdate,
  type UniLioScormRuntimeUpdate,
} from "../../../api/hooks/useUniLioScormRuntime";
import { Scorm12Api } from "./Scorm12Api";

type Props = {
  courseId: string;
  onCompletable?: () => void;
};

function resolveScormUrl(launchUrl: string): string {
  // Keep same-origin relative path so the SCO can reach window.parent.API (SCORM 1.2).
  let path = launchUrl;
  if (/^https?:\/\//i.test(launchUrl)) {
    try {
      const u = new URL(launchUrl);
      path = `${u.pathname}${u.search}`;
    } catch {
      path = launchUrl;
    }
  }
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }
  const uat = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("uat") === "1";
  if (uat) {
    path += path.includes("?") ? "&uat=1" : "?uat=1";
  }
  return path;
}

export function UniLioScormPlayer({ courseId, onCompletable }: Props) {
  const { data: runtime, isLoading, isError } = useUniLioScormRuntime(courseId);
  const updateRuntime = useUniLioScormRuntimeUpdate(courseId);
  const apiRef = useRef<Scorm12Api | null>(null);
  const [iframeKey, setIframeKey] = useState(0);
  const onCompletableRef = useRef(onCompletable);
  onCompletableRef.current = onCompletable;

  useEffect(() => {
    if (!runtime) return;

    const handleCommit = (update: UniLioScormRuntimeUpdate) => {
      void updateRuntime.mutateAsync(update).then((result) => {
        if (result.courseCompletable || update.finish) {
          if (result.courseCompletable) {
            onCompletableRef.current?.();
          }
        }
      });
    };

    const scormApi = new Scorm12Api(runtime, handleCommit);
    scormApi.install();
    apiRef.current = scormApi;

    // Force iframe reload so the SCO picks up the new window.API
    setIframeKey((k) => k + 1);

    return () => {
      scormApi.uninstall();
      apiRef.current = null;
    };
    // runtime identity changes only on courseId change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, runtime?.studentId]);

  if (isLoading) {
    return (
      <div className="unilio-scorm-player unilio-scorm-player--loading">
        <p>Carregando conteúdo SCORM…</p>
      </div>
    );
  }

  if (isError || !runtime) {
    return (
      <div className="unilio-scorm-player unilio-scorm-player--error">
        <p>Não foi possível carregar o conteúdo SCORM. Tente novamente.</p>
      </div>
    );
  }

  const src = resolveScormUrl(runtime.launchUrl);

  return (
    <div className="unilio-scorm-player">
      <iframe
        key={iframeKey}
        className="unilio-scorm-player__frame"
        src={src}
        title="Conteúdo SCORM"
        allow="fullscreen"
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
      />
    </div>
  );
}
