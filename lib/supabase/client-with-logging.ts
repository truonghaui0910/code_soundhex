
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { logger } from "@/lib/services/logger";

class SupabaseClientWithLogging {
  private client = createClientComponentClient();
  private sessionCache: any = null;
  private lastSessionCheck = 0;
  private SESSION_CACHE_DURATION = 30000; // 30 seconds

  // Auth methods with logging
  auth = {
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      const startTime = Date.now();
      logger.logInfo('AUTH_SIGNIN_START', { email: credentials.email });
      
      try {
        const result = await this.client.auth.signInWithPassword(credentials);
        const duration = Date.now() - startTime;
        
        if (result.error) {
          logger.logError('AUTH_SIGNIN_ERROR', result.error.message, {
            email: credentials.email,
            duration
          });
        } else {
          logger.logInfo('AUTH_SIGNIN_SUCCESS', {
            email: credentials.email,
            userId: result.data.user?.id,
            duration
          });
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.logError('AUTH_SIGNIN_EXCEPTION', String(error), {
          email: credentials.email,
          duration
        });
        throw error;
      }
    },

    signUp: async (credentials: { email: string; password: string; options?: any }) => {
      const startTime = Date.now();
      logger.logInfo('AUTH_SIGNUP_START', { email: credentials.email });
      
      try {
        const result = await this.client.auth.signUp(credentials);
        const duration = Date.now() - startTime;
        
        if (result.error) {
          logger.logError('AUTH_SIGNUP_ERROR', result.error.message, {
            email: credentials.email,
            duration
          });
        } else {
          logger.logInfo('AUTH_SIGNUP_SUCCESS', {
            email: credentials.email,
            userId: result.data.user?.id,
            duration
          });
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.logError('AUTH_SIGNUP_EXCEPTION', String(error), {
          email: credentials.email,
          duration
        });
        throw error;
      }
    },

    signOut: async () => {
      const startTime = Date.now();
      logger.logInfo('AUTH_SIGNOUT_START');
      
      try {
        const result = await this.client.auth.signOut();
        const duration = Date.now() - startTime;
        
        // Clear session cache
        this.sessionCache = null;
        this.lastSessionCheck = 0;
        
        if (result.error) {
          logger.logError('AUTH_SIGNOUT_ERROR', result.error.message, { duration });
        } else {
          logger.logInfo('AUTH_SIGNOUT_SUCCESS', { duration });
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.logError('AUTH_SIGNOUT_EXCEPTION', String(error), { duration });
        throw error;
      }
    },

    getSession: async () => {
      const now = Date.now();
      
      // Return cached session if still valid
      if (this.sessionCache && (now - this.lastSessionCheck) < this.SESSION_CACHE_DURATION) {
        return this.sessionCache;
      }
      
      const startTime = Date.now();
      
      try {
        const result = await this.client.auth.getSession();
        const duration = Date.now() - startTime;
        
        // Cache the result
        this.sessionCache = result;
        this.lastSessionCheck = now;
        
        if (result.error) {
          logger.logError('AUTH_GET_SESSION_ERROR', result.error.message, { duration });
        }
        // Only log session success on first load or after significant time
        else if (!this.sessionCache || (now - this.lastSessionCheck) > 300000) { // 5 minutes
          logger.logInfo('AUTH_GET_SESSION_SUCCESS', {
            hasSession: !!result.data.session,
            userId: result.data.session?.user?.id,
            duration
          });
        }
        
        return result;
      } catch (error) {
        const duration = Date.now() - startTime;
        logger.logError('AUTH_GET_SESSION_EXCEPTION', String(error), { duration });
        throw error;
      }
    },

    onAuthStateChange: (callback: any) => {
      logger.logInfo('AUTH_STATE_LISTENER_SETUP');
      return this.client.auth.onAuthStateChange((event, session) => {
        // Only log important auth state changes
        if (event !== 'TOKEN_REFRESHED') {
          logger.logInfo('AUTH_STATE_CHANGE', {
            event,
            hasSession: !!session,
            userId: session?.user?.id
          });
        }
        callback(event, session);
      });
    }
  };

  // Database methods with logging (simplified to reduce noise)
  from = (table: string) => {
    const query = this.client.from(table);
    
    const originalSelect = query.select.bind(query);
    const originalInsert = query.insert.bind(query);
    const originalUpdate = query.update.bind(query);
    const originalDelete = query.delete.bind(query);

    query.select = (...args: any[]) => {
      const startTime = Date.now();
      const result = originalSelect(...args);
      
      // Override the promise to log completion (only errors)
      const originalThen = result.then.bind(result);
      result.then = (onResolve: any, onReject?: any) => {
        return originalThen(
          (data: any) => {
            const duration = Date.now() - startTime;
            if (data.error) {
              logger.logError('DB_QUERY_ERROR', data.error.message, {
                table,
                operation: 'SELECT',
                duration
              });
            }
            return onResolve(data);
          },
          (error: any) => {
            const duration = Date.now() - startTime;
            logger.logError('DB_QUERY_EXCEPTION', String(error), {
              table,
              operation: 'SELECT',
              duration
            });
            return onReject ? onReject(error) : Promise.reject(error);
          }
        );
      };
      
      return result;
    };

    query.insert = (values: any) => {
      const startTime = Date.now();
      logger.logInfo('DB_INSERT_START', { table });
      const result = originalInsert(values);
      
      const originalThen = result.then.bind(result);
      result.then = (onResolve: any, onReject?: any) => {
        return originalThen(
          (data: any) => {
            const duration = Date.now() - startTime;
            if (data.error) {
              logger.logError('DB_INSERT_ERROR', data.error.message, {
                table,
                duration
              });
            } else {
              logger.logInfo('DB_INSERT_SUCCESS', {
                table,
                duration
              });
            }
            return onResolve(data);
          },
          (error: any) => {
            const duration = Date.now() - startTime;
            logger.logError('DB_INSERT_EXCEPTION', String(error), {
              table,
              duration
            });
            return onReject ? onReject(error) : Promise.reject(error);
          }
        );
      };
      
      return result;
    };

    return query;
  };
}

export const supabaseWithLogging = new SupabaseClientWithLogging();
