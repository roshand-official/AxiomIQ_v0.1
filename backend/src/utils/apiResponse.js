class ApiResponse {
  static success(res, data = null, message = 'Operation successful', statusCode = 200, meta = null) {
    const payload = {
      success: true,
      message,
      data,
    };
    if (meta) {
      payload.meta = meta;
    }
    return res.status(statusCode).json(payload);
  }

  static created(res, data = null, message = 'Resource created successfully') {
    return ApiResponse.success(res, data, message, 201);
  }

  static paginated(res, data, page, limit, total, message = 'Data retrieved successfully') {
    const totalPages = Math.ceil(total / limit) || 1;
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  }
}

module.exports = ApiResponse;
