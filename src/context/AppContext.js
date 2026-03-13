import React, { createContext, useState, useContext, useEffect } from "react";

export const AppContext = createContext();

const DEFAULT_VIEW_ITEMS = [
  {
    name: "Not started",
    id: 1,
    color: "bg-red-300/20",
    tasks: [
      {
        title: "Technical Interview",
        id: 1,
        description: "Interview with the technical team",
      },
      {
        title: "Call with the CEO",
        id: 2,
        description: "Call with the CEO of the company",
      },
    ],
  },
  {
    name: "To Do",
    id: 2,
    color: "bg-blue-300/20",
    tasks: [
      {
        title: "Review This Assignment",
        id: 2,
        description: "Review this assignment and select the best candidate",
      },
    ],
  },
  {
    name: "In progress",
    id: 3,
    color: "bg-yellow-300/20",
    tasks: [
      {
        title: "Drag and Drop",
        id: 3,
        description: "Drag and Drop functionality",
      },
    ],
  },
  {
    name: "Done",
    id: 4,
    color: "bg-green-300/20",
    tasks: [
      {
        title: "Apply for the job",
        id: 4,
        description: "Apply for the job",
      },
      {
        title: "Message the recruiter",
        id: 5,
        description: "Message the recruiter",
      },
      {
        title: "Send the CV",
        id: 6,
        description: "Send the CV",
      },
      {
        title: "Introductory call",
        id: 7,
        description: "Introductory call",
      },
    ],
  },
];

export function useTask() {
  return useContext(AppContext);
}

export const AppProvider = ({ children }) => {
  const [viewItems, setViewItems] = useState(DEFAULT_VIEW_ITEMS);
  const [taskId, setTaskId] = useState(null);
  const [authUser, setAuthUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isApiAvailable, setIsApiAvailable] = useState(false);

  useEffect(() => {
    if (isCachePresent()) {
      const cache = JSON.parse(localStorage.getItem("viewItems"));
      setViewItems(cache);
    }

    const hydrateSession = async () => {
      try {
        const sessionResponse = await fetch("/api/me", {
          credentials: "include",
        });

        if (sessionResponse.status === 404) {
          setIsApiAvailable(false);
          return;
        }

        if (!sessionResponse.ok) {
          throw new Error("No active session");
        }

        setIsApiAvailable(true);

        const sessionData = await sessionResponse.json();
        if (!sessionData.authenticated) {
          return;
        }

        setAuthUser({ email: sessionData.email });

        const boardResponse = await fetch("/api/board", {
          credentials: "include",
        });

        if (!boardResponse.ok) {
          return;
        }

        const boardData = await boardResponse.json();
        if (Array.isArray(boardData.viewItems)) {
          setViewItems(boardData.viewItems);
          storeCache(boardData.viewItems);
        }
      } catch (error) {
        setIsApiAvailable(false);
        setAuthUser(null);
      } finally {
        setIsAuthLoading(false);
      }
    };

    hydrateSession();
  }, []);

  const isCachePresent = () => {
    const data = localStorage.getItem("viewItems");
    if (data) {
      return true;
    }
    return false;
  };

  const storeCache = (data) => {
    localStorage.setItem("viewItems", JSON.stringify(data));
  };

  const persistData = async (data) => {
    storeCache(data);

    if (!authUser) {
      return;
    }

    try {
      setIsCloudSyncing(true);
      await fetch("/api/board", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ viewItems: data }),
      });
    } catch (error) {
      setAuthError(
        "Could not sync to cloud right now. Local save still works.",
      );
    } finally {
      setIsCloudSyncing(false);
    }
  };

  const register = async (email, password) => {
    setAuthError("");

    if (!isApiAvailable) {
      setAuthError(
        "Auth API is not available in npm start. Use Vercel deployment or run `npx vercel dev`.",
      );
      return { success: false };
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, viewItems }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || "Registration failed.");
        return { success: false };
      }

      setAuthUser({ email: data.email });
      if (Array.isArray(data.viewItems)) {
        setViewItems(data.viewItems);
        storeCache(data.viewItems);
      }
      return { success: true };
    } catch (error) {
      setAuthError("Registration failed. Please try again.");
      return { success: false };
    }
  };

  const login = async (email, password) => {
    setAuthError("");

    if (!isApiAvailable) {
      setAuthError(
        "Auth API is not available in npm start. Use Vercel deployment or run `npx vercel dev`.",
      );
      return { success: false };
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAuthError(data.error || "Login failed.");
        return { success: false };
      }

      setAuthUser({ email: data.email });
      if (Array.isArray(data.viewItems)) {
        setViewItems(data.viewItems);
        storeCache(data.viewItems);
      }
      return { success: true };
    } catch (error) {
      setAuthError("Login failed. Please try again.");
      return { success: false };
    }
  };

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      // Keep local mode active even if logout endpoint is unavailable.
    } finally {
      setAuthUser(null);
      setAuthError("");
    }
  };

  const addTask = (title, viewId) => {
    const newTask = {
      id: Math.floor(Math.random() * 10000),
      title,
      description: "",
    };

    const newViewItems = viewItems.map((view) =>
      view.id === viewId ? { ...view, tasks: [...view.tasks, newTask] } : view,
    );
    setViewItems(newViewItems);
    persistData(newViewItems);
  };

  const addView = (name) => {
    const newView = {
      name,
      id: Math.floor(Math.random() * 10000),
      color: "bg-orange-300/20",
      tasks: [],
    };
    const newViewItems = [...viewItems, newView];
    setViewItems(newViewItems);
    persistData(newViewItems);
  };

  const deleteTask = (taskId, viewId) => {
    const newViewItems = viewItems.map((view) =>
      view.id === viewId
        ? {
            ...view,
            tasks: view.tasks.filter((task) => task.id !== taskId),
          }
        : view,
    );
    setViewItems(newViewItems);
    persistData(newViewItems);
  };

  const updateTask = (taskId, viewId, title, description) => {
    const newViewItems = viewItems.map((view) =>
      view.id === viewId
        ? {
            ...view,
            tasks: view.tasks.map((task) =>
              task.id === taskId
                ? { ...task, title, description }
                : { ...task },
            ),
          }
        : view,
    );
    setViewItems(newViewItems);
    persistData(newViewItems);
  };

  const changeView = (currentTask, fromViewId, toViewId) => {
    // console.log({ currentTask, fromViewId, toViewId });
    const newTask = {
      id: Math.floor(Math.random() * 10000),
      title: currentTask.title,
      description: currentTask.description,
    };

    const newViewItems = viewItems.map((view) =>
      view.id === Number(toViewId)
        ? { ...view, tasks: [...view.tasks, newTask] }
        : view,
    );
    setViewItems(newViewItems);
    // remove task from previous view
    const newViewItems2 = newViewItems.map((view) =>
      view.id === Number(fromViewId)
        ? {
            ...view,
            tasks: view.tasks.filter((task) => task.id !== currentTask.id),
          }
        : view,
    );
    setViewItems(newViewItems2);
    persistData(newViewItems2);
    // deleteTask(currentTask.id, fromViewId);
  };

  const value = {
    viewItems,
    addTask,
    addView,
    setTaskId,
    taskId,
    deleteTask,
    updateTask,
    changeView,
    authUser,
    isAuthLoading,
    isCloudSyncing,
    authError,
    isApiAvailable,
    login,
    register,
    logout,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
