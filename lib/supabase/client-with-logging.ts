import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { logger } from "../services/logger";

interface AuthCredentials {
  email: string;
  password: string;
  options?: Record<string, any>;
}

interface SessionCache {
  data: any;
  error: any;
}

class SupabaseClientWithLogging {
  private client = createClientComponentClient();
  private sessionCache: SessionCache | null = null;
  private lastSessionCheck = 0;
  private SESSION_CACHE_DURATION = 30000; // 30 seconds

  // Auth methods with logging
  auth = {
    signInWithPassword: async (credentials: AuthCredentials) => {
      const startTime = Date.now();
      logger.logInfo("AUTH_SIGNIN_START", { email: credentials.email });

      try {
        const result = await this.client.auth.signInWithPassword(credentials);
        const duration = Date.now() - startTime;

        if (result.error) {
          logger.logError("AUTH_SIGNIN_ERROR", result.error.message, {
            email: credentials.email,
            duration,
          });
        } else {
          logger.logInfo("AUTH_SIGNIN_SUCCESS", {
            email: credentials.email,
            userId: result.data.user?.id,
            duration,
          });
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.logError("AUTH_SIGNIN_EXCEPTION", String(error), {
          email: credentials.email,
          duration,
        });
        throw error;
      }
    },

    signUp: async (credentials: AuthCredentials) => {
      const startTime = Date.now();
      logger.logInfo("AUTH_SIGNUP_START", { email: credentials.email });

      try {
        const result = await this.client.auth.signUp(credentials);
        const duration = Date.now() - startTime;

        if (result.error) {
          logger.logError("AUTH_SIGNUP_ERROR", result.error.message, {
            email: credentials.email,
            duration,
          });
        } else {
          logger.logInfo("AUTH_SIGNUP_SUCCESS", {
            email: credentials.email,
            userId: result.data.user?.id,
            duration,
          });
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.logError("AUTH_SIGNUP_EXCEPTION", String(error), {
          email: credentials.email,
          duration,
        });
        throw error;
      }
    },

    signOut: async () => {
      const startTime = Date.now();
      logger.logInfo("AUTH_SIGNOUT_START");

      try {
        const result = await this.client.auth.signOut();
        const duration = Date.now() - startTime;

        // Clear session cache
        this.sessionCache = null;
        this.lastSessionCheck = 0;

        if (result.error) {
          logger.logError("AUTH_SIGNOUT_ERROR", result.error.message, {
            duration,
          });
        } else {
          logger.logInfo("AUTH_SIGNOUT_SUCCESS", { duration });
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.logError("AUTH_SIGNOUT_EXCEPTION", String(error), { duration });
        throw error;
      }
    },

    getSession: async () => {
      const now = Date.now();

      // Return cached session if still valid
      if (
        this.sessionCache &&
        now - this.lastSessionCheck < this.SESSION_CACHE_DURATION
      ) {
        return this.sessionCache;
      }

      const startTime = Date.now();
      const hadCachedSession = !!this.sessionCache;

      try {
        const result = await this.client.auth.getSession();
        const duration = Date.now() - startTime;

        // Cache the result
        this.sessionCache = result;
        this.lastSessionCheck = now;

        if (result.error) {
          logger.logError("AUTH_GET_SESSION_ERROR", result.error.message, {
            duration,
          });
        }
        // Only log session success on first load or after significant time (5 minutes)
        else if (!hadCachedSession || now - this.lastSessionCheck > 300000) {
          logger.logInfo("AUTH_GET_SESSION_SUCCESS", {
            hasSession: !!result.data.session,
            userId: result.data.session?.user?.id,
            duration,
          });
        }

        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.logError("AUTH_GET_SESSION_EXCEPTION", String(error), {
          duration,
        });
        throw error;
      }
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      logger.logInfo("AUTH_STATE_LISTENER_SETUP");
      return this.client.auth.onAuthStateChange((event, session) => {
        // Only log important auth state changes
        if (event !== "TOKEN_REFRESHED") {
          logger.logInfo("AUTH_STATE_CHANGE", {
            event,
            hasSession: !!session,
            userId: session?.user?.id,
          });
        }
        callback(event, session);
      });
    },
  };

  // Database methods with logging
  from = (table: string) => {
    const query = this.client.from(table);

    // Create wrapper functions instead of overriding methods
    const wrappedQuery = {
      ...query,

      select: (...args: any[]) => {
        const startTime = Date.now();
        const originalResult = query.select(...args);

        // Return a new promise instead of overriding then
        return this.wrapDatabaseOperation(originalResult, {
          table,
          operation: "SELECT",
          startTime,
          logSuccess: false, // Don't log SELECT success to reduce noise
        });
      },

      insert: (values: any) => {
        const startTime = Date.now();
        logger.logInfo("DB_INSERT_START", { table });
        const originalResult = query.insert(values);

        return this.wrapDatabaseOperation(originalResult, {
          table,
          operation: "INSERT",
          startTime,
          logSuccess: true,
        });
      },

      update: (values: any) => {
        const startTime = Date.now();
        logger.logInfo("DB_UPDATE_START", { table });
        const originalResult = query.update(values);

        return this.wrapDatabaseOperation(originalResult, {
          table,
          operation: "UPDATE",
          startTime,
          logSuccess: true,
        });
      },

      delete: () => {
        const startTime = Date.now();
        logger.logInfo("DB_DELETE_START", { table });
        const originalResult = query.delete();

        return this.wrapDatabaseOperation(originalResult, {
          table,
          operation: "DELETE",
          startTime,
          logSuccess: true,
        });
      },
    };

    return wrappedQuery;
  };

  private wrapDatabaseOperation(
    originalResult: Promise<any>,
    options: {
      table: string;
      operation: string;
      startTime: number;
      logSuccess: boolean;
    },
  ): Promise<any> {
    const { table, operation, startTime, logSuccess } = options;

    return new Promise((resolve, reject) => {
      originalResult
        .then((data: any) => {
          const duration = Date.now() - startTime;

          if (data.error) {
            logger.logError(`DB_${operation}_ERROR`, data.error.message, {
              table,
              duration,
            });
          } else if (logSuccess) {
            logger.logInfo(`DB_${operation}_SUCCESS`, {
              table,
              duration,
            });
          }

          resolve(data);
        })
        .catch((error: any) => {
          const duration = Date.now() - startTime;
          logger.logError(`DB_${operation}_EXCEPTION`, String(error), {
            table,
            duration,
          });
          reject(error);
        });
    });
  }
}

export const supabaseWithLogging = new SupabaseClientWithLogging();
