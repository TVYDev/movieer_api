const listJsonResponse = (model, populate) => async (req, res, next) => {
    // Copy query params
    const reqQuery = { ...req.query };

    // Excluded fields
    const excludedFields = ['select', 'sort', 'limit', 'page'];
    excludedFields.forEach((param) => delete reqQuery[param]);

    // String of query params
    let queryStr = JSON.stringify(reqQuery);

    // Replace string to match mongoose operator with prefix '$'
    queryStr = queryStr.replace(
        /\b(gt|gte|lt|lte|in)\b/g,
        (match) => `$${match}`
    );

    let query = model.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
        const select = req.query.select.split(',').join(' ');
        query = query.select(select);
    }

    // Sorty By
    if (req.query.sort) {
        const sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const totalCount = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const items = await query;

    let pagination = {
        count: items.length,
        totalCount,
        limit,
        currentPage: page
    };

    if (startIndex > 0) {
        pagination.prevPage = page - 1;
    }
    if (endIndex < totalCount) {
        pagination.nextPage = page + 1;
    }

    res.listJsonData = {
        items,
        pagination
    };

    next();
};

module.exports = listJsonResponse;