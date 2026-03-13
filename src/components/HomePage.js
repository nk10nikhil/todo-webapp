import React from "react";
import { useTask } from "../context/AppContext";
import TaskView from "./TaskView";
import AuthModal from "./AuthModal";

function HomePage() {
  const task = useTask();

  const [newViewName, setNewViewName] = React.useState("");
  const [isNewViewInputOpen, setIsNewViewInputOpen] = React.useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = React.useState(false);

  const createNewView = () => {
    task.addView(newViewName);
    setNewViewName("");
    setIsNewViewInputOpen(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col px-4 md:px-10 pt-6 md:pt-10 gap-8 md:gap-16">
      <div className="flex items-start justify-between gap-4">
        <div className="text-base md:text-2xl lg:text-4xl font-semibold text-slate-600 first-letter:px-2 first-letter:mr-1 first-letter:shadow-md first-letter:bg-white">
          <span className="tracking-widest"> / My</span> To-Do App:
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs md:text-sm font-semibold text-slate-700 hover:border-slate-400"
            onClick={() => setIsAuthModalOpen(true)}
          >
            {task.authUser ? "Account" : "Login"}
          </button>

          {task.authUser ? (
            <div className="flex items-center gap-2 text-xs md:text-sm text-slate-600">
              <span className="rounded bg-green-100 px-2 py-1 font-semibold text-green-700">
                {task.authUser.email}
              </span>
              <button
                onClick={task.logout}
                className="rounded border border-slate-300 px-2 py-1 font-semibold hover:bg-slate-100"
              >
                Logout
              </button>
            </div>
          ) : (
            <span className="text-[11px] md:text-xs text-slate-500">
              Guest mode: local save only
            </span>
          )}

          {task.authUser && task.isCloudSyncing ? (
            <span className="text-[11px] md:text-xs text-blue-600 font-semibold">
              Syncing to cloud...
            </span>
          ) : null}
        </div>
      </div>
      <div className="flex flex-col md:flex-row gap-4 md:flex-nowrap overflow-y-auto md:overflow-y-hidden md:overflow-x-scroll h-full px-0 md:px-5 pb-4">
        {task.viewItems.map((view) => (
          <TaskView key={view.id} view={view} viewId={view.id} />
        ))}
        <div className="w-full md:w-auto">
          {isNewViewInputOpen ? (
            <input
              type="text"
              value={newViewName}
              onChange={(e) => setNewViewName(e.target.value)}
              className="w-full md:w-auto text-slate-700 px-2 py-1 rounded-md bg-orange-300/20 focus:outline-none font-semibold text-sm"
              onKeyDown={(e) =>
                e.key === "Enter" && newViewName && createNewView()
              }
              autoFocus
              onBlur={() => setIsNewViewInputOpen(false)}
            />
          ) : (
            <button
              className="font-semibold text-gray-400 cursor-pointer w-full md:min-w-[200px] md:w-auto text-left"
              onClick={() => setIsNewViewInputOpen(true)}
            >
              + New View
            </button>
          )}
          <div></div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={task.login}
        onRegister={task.register}
        authError={task.authError}
        isApiAvailable={task.isApiAvailable}
      />
    </div>
  );
}

export default HomePage;
