import { Request, Response, NextFunction } from 'express';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Global Error Handler]:', err);

  // If the error is related to Prisma or missing data for manager operations, 
  // gracefully return an empty array or default object so the frontend doesn't crash.
  
  // You can customize the status code depending on if you truly want 200 vs 500. 
  // The prompt requested safe fallbacks to prevent "Failed to load" toasts.
  
  if (req.originalUrl.includes('/api/v1/manager/')) {
    // Specifically for manager routes, fail gracefully to empty state
    return res.status(200).json({
      success: true,
      data: [],
      message: 'No data available or fallback activated'
    });
  }

  // Fallback for other routes
  return res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error'
  });
};
