const advancedResults = (model, populate) => async (req, res, next) => {
  // we initially set the query
  let query;

  // make copy of the req.query

  const reqQuery = { ...req.query };

  // Fields to exclude

  const removeFields = ["select", "sort", "page", "limit"];

  // loop over removeFields and delete them from reqQuery

  removeFields.forEach((param) => delete reqQuery[param]);

  // we then convert the query object from the request from json to string to concatenate it to a string
  let queryStr = JSON.stringify(reqQuery);

  // Create  mongoose operators for filtering ($gt, $gte, etc) from the query string
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // console.log(reqQuery);

  // we then construct the find method to reflect the find method and add the optional query string parsed back to json....
  // console.log(queryStr);
  query = model.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");

    query = query.select(fields);
  }

  // Sort

  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }

  // Pagination

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 25;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.skip(startIndex).limit(limit);

  //   populate query
  if (populate) {
    query = query.populate(populate);
  }

  // we then find using this query
  const results = await query;

  // pagination result

  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.advancedResults = {
    success: true,
    count: results.length,
    pagination,
    data: results,
  };

  next();
};

module.exports = advancedResults;
