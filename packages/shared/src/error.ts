export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    options: {
      code?: string;
      details?: unknown;
      isOperational?: boolean;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.code = options.code ?? defaultCodeForStatus(statusCode);
    this.details = options.details;
    this.isOperational = options.isOperational ?? true;
    if (options.cause) (this as { cause?: unknown }).cause = options.cause;
    Error.captureStackTrace?.(this, this.constructor);
  }

  toJSON() {
    return {
      success: false as const,
      error: {
        code: this.code,
        message: this.message,
        statusCode: this.statusCode,
        details: this.details,
      },
    };
  }

  // ---- Named factories — read better than passing magic numbers ----
  static badRequest(message = "Bad request", details?: unknown) {
    return new ApiError(400, message, { code: "BAD_REQUEST", details });
  }
  static unauthorized(message = "Authentication required") {
    return new ApiError(401, message, { code: "UNAUTHORIZED" });
  }
  static forbidden(message = "You do not have permission to perform this action") {
    return new ApiError(403, message, { code: "FORBIDDEN" });
  }
  static notFound(message = "Resource not found") {
    return new ApiError(404, message, { code: "NOT_FOUND" });
  }
  static conflict(message = "Resource already exists", details?: unknown) {
    return new ApiError(409, message, { code: "CONFLICT", details });
  }
  static gone(message = "Resource is no longer available") {
    return new ApiError(410, message, { code: "GONE" });
  }
  static unprocessable(message = "Validation failed", details?: unknown) {
    return new ApiError(422, message, { code: "UNPROCESSABLE_ENTITY", details });
  }
  static tooMany(message = "Too many requests, slow down") {
    return new ApiError(429, message, { code: "RATE_LIMITED" });
  }
  static internal(message = "Internal server error", cause?: unknown) {
    return new ApiError(500, message, { code: "INTERNAL_ERROR", cause, isOperational: false });
  }
}

function defaultCodeForStatus(status: number): string {
  switch (status) {
    case 400:
      return "BAD_REQUEST";
    case 401:
      return "UNAUTHORIZED";
    case 403:
      return "FORBIDDEN";
    case 404:
      return "NOT_FOUND";
    case 409:
      return "CONFLICT";
    case 410:
      return "GONE";
    case 422:
      return "UNPROCESSABLE_ENTITY";
    case 429:
      return "RATE_LIMITED";
    default:
      return status >= 500 ? "INTERNAL_ERROR" : "ERROR";
  }
}

export class ApiResponse<T> {
  public readonly success = true as const;
  constructor(
    public readonly statusCode: number,
    public readonly data: T,
    public readonly message: string = "OK",
    public readonly meta?: Record<string, unknown>,
  ) {}

  get body() {
    return {
      success: this.success,
      message: this.message,
      data: this.data,
      ...(this.meta ? { meta: this.meta } : {}),
    };
  }

  static ok<T>(data: T, message = "OK", meta?: Record<string, unknown>) {
    return new ApiResponse(200, data, message, meta);
  }
  static created<T>(data: T, message = "Created") {
    return new ApiResponse(201, data, message);
  }
  static accepted<T>(data: T, message = "Accepted") {
    return new ApiResponse(202, data, message);
  }
  static noContent() {
    return new ApiResponse(204, null, "No content");
  }
}

/** Typed wrapper for "wrap an async handler, forward any thrown ApiError". */
export type AsyncFn<TArgs extends unknown[], TRet> = (...args: TArgs) => Promise<TRet>;

export const asyncHandler =
  <TArgs extends unknown[], TRet>(fn: AsyncFn<TArgs, TRet>) =>
  async (...args: TArgs): Promise<TRet> => {
    try {
      return await fn(...args);
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw ApiError.internal(err instanceof Error ? err.message : "Unexpected error", err);
    }
  };
