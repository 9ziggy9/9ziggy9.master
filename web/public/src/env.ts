type Environment = {
  INITIALIZED: boolean,
  PRODUCTION?: boolean,
  GATEWAY_DB?: string,
  GATEWAY_WS?: string,
};

export const VARS: Environment = { INITIALIZED: false };

export function LOAD_VARS(): boolean {
  VARS.PRODUCTION = JSON.parse(process.env.TS_PROD as string);
  VARS.GATEWAY_DB = VARS.PRODUCTION === true
    ? process.env.TS_GATEWAY_DB_PROD as string
    : process.env.TS_GATEWAY_DB_DEV as string;
  VARS.GATEWAY_WS = VARS.PRODUCTION === true
    ? process.env.TS_GATEWAY_WS_PROD as string
    : process.env.TS_GATEWAY_WS_DEV as string;
  return VARS.INITIALIZED = true;
}
