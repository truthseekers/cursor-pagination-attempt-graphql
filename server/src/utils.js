module.exports.paginateResults = ({
  after: cursorAfter, // *** Name this cursorBefore... or beforeCursor . need before and after.
  first, // too lazy to figure out the conditional logic required when having default values for first and last
  results,
  before: cursorBefore,
  last = 3,
  // can pass in a function to calculate an item's cursor
  getCursor = () => null,
}) => {
  // format all results into the correct "node / cursor" shape
  const edgedResults = results.map((elem) => {
    return {
      node: elem,
      cursor: elem.id,
    };
  });

  // when using the "first, after" params
  if (cursorAfter || first || first == 0) {
    // when 'first' is below 1, return empty result set. Wasn't sure what to do with pageInfo in this case.
    if (first < 1)
      return {
        edges: [],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: edgedResults[0].cursor,
          endCursor: edgedResults[0].cursor,
        },
      };

    // Without an 'after' cursor, we get the "first" num of results off the beginning of the result set.
    if (!cursorAfter) {
      let resultsToReturn = edgedResults.slice(0, first);

      return {
        edges: edgedResults.slice(0, first),
        pageInfo: {
          hasNextPage: first < edgedResults.length ? true : false,
          hasPreviousPage: false,
          startCursor: resultsToReturn[0].cursor,
          endCursor: resultsToReturn[resultsToReturn.length - 1].cursor,
        },
      };
    }
    // find the index of the element that has the 'cursorAfter' .
    const cursorIndex = edgedResults.findIndex((item) => {
      let itemCursor = item.node.id ? item.node.id : getCursor(item);

      // if there's still not a cursor, return false by default
      return itemCursor ? cursorAfter == itemCursor : false;
    });

    ////if cursorIndex is greater than 0 ...
    //////// then if cursorIndex is equal to the last item in the result set..
    //////////// return an empty array (because there are no more results.)
    //////// cursor index is >= 0, but NOT the last item in the array, so... get results starting after the cursor and ending at whichever is smallest of: length of the result set, or the number of results you want + the cursorIndex + 1. (starting point of slice + num of results to grab)
    // need the smallest so we don't try to get results after the final element.
    // if cursorIndex is not >= 0, just slice from 0 to the "first" param.
    let resultSet =
      cursorIndex >= 0
        ? cursorIndex === edgedResults.length - 1 // don't let us overflow
          ? []
          : edgedResults.slice(
              cursorIndex + 1,
              Math.min(edgedResults.length, cursorIndex + 1 + first)
            )
        : edgedResults.slice(0, first); // handles nonexistent cursorAfter

    // return resultSet;

    // Not ready to deal with these edge cases yet.
    // in this case, We're trying to get results AFTER the last item in the result set.
    if (resultSet.length == 0) {
      return {
        edges: resultSet,
        pageInfo: {
          hasNextPage: false,
          hasPreviousPage: true,
          startCursor: null,
          endCursor: null,
        },
      };
    }

    let lastItemIndex = edgedResults.findIndex((item) => {
      return item.cursor == resultSet[resultSet.length - 1].cursor;
    }); //

    let firstItemIndex = edgedResults.findIndex((item) => {
      return item.cursor == resultSet[0].cursor;
    });

    return {
      edges: resultSet,
      pageInfo: {
        hasNextPage: lastItemIndex < edgedResults.length - 1 ? true : false,
        hasPreviousPage: firstItemIndex > 0 ? true : false,
        startCursor: resultSet[0].cursor,
        endCursor: resultSet[resultSet.length - 1].cursor,
      },
    };
  }

  if (cursorBefore || last) {
    console.log("cursorBEFORE");
    console.log("paginateResults 1");
    if (last < 1) {
      //return [];
      return {
        edges: [],
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: false,
          startCursor: edgedResults[0].cursor,
          endCursor: edgedResults[0].cursor,
        },
      };
    }
    console.log("paginateResults 2");

    if (!cursorBefore) {
      let resultsToReturn = edgedResults.slice(
        edgedResults.length - last,
        edgedResults.length
      ); // handles getting the "last x items"

      console.log("last: ", last);
      console.log("resultsToReturn.length: ", resultsToReturn.length);

      return {
        edges: resultsToReturn,
        pageInfo: {
          hasNextPage: last < edgedResults.length ? true : false,
          hasPreviousPage: false,
          startCursor: resultsToReturn[0].cursor,
          endCursor: resultsToReturn[resultsToReturn.length - 1].cursor,
        },
      };
    }
    console.log("paginateResults 3");
    // find the index of the element that has the cursor passed in.
    const cursorIndex = edgedResults.findIndex((item) => {
      // if an item has a `cursor` on it, use that, otherwise try to generate one
      let itemCursor = item.node.id ? item.node.id : getCursor(item);
      // console.log("itemCursor in the findIndex: ", itemCursor);

      // if there's still not a cursor, return false by default
      return itemCursor ? cursorBefore == itemCursor : false;
    });

    console.log("cursorIndex: ", cursorIndex);
    ////if cursorIndex is greater than 0 ...
    //////// then if cursorIndex is equal to the last item in the result set..
    //////////// return an empty array (because there are no more results.)
    //////// cursor index is >= 0, but NOT the last item in the array, so... get results starting at the cursor and ending at whichever is smallest of: length of the result set, or the number of results you want + the cursorIndex + 1. (starting point of slice + num of results to grab)
    // need the smallest so we don't try to get results after the final element.

    let resultSet =
      cursorIndex >= 0
        ? cursorIndex >= edgedResults.length - 1 // get the LAST items if we've gone beyond the length of the array? wont work with uuid
          ? edgedResults.slice(Math.max(cursorIndex - last, 0), cursorIndex)
          : edgedResults.slice(Math.max(cursorIndex - last, 0), cursorIndex)
        : edgedResults.slice(0, last);

    let lastItemIndex = edgedResults.findIndex((item) => {
      return item.cursor == resultSet[resultSet.length - 1].cursor;
    }); //

    let firstItemIndex = edgedResults.findIndex((item) => {
      return item.cursor == resultSet[0].cursor;
    });

    return {
      edges: resultSet,
      pageInfo: {
        hasNextPage: firstItemIndex > 0 ? true : false,
        hasPreviousPage: lastItemIndex < edgedResults.length - 1 ? true : false,
        startCursor: resultSet[0].cursor,
        endCursor: resultSet[resultSet.length - 1].cursor,
      },
    };
  }
};

module.exports.paginateResultsOld = ({
  after: cursor,
  pageSize = 3,
  results,
  // can pass in a function to calculate an item's cursor
  getCursor = () => null,
}) => {
  console.log("paginateResults 1");
  if (pageSize < 1) return [];
  console.log("paginateResults 2");

  if (!cursor) return results.slice(0, pageSize);
  console.log("paginateResults 3");
  const cursorIndex = results.findIndex((item) => {
    // if an item has a `cursor` on it, use that, otherwise try to generate one
    let itemCursor = item.cursor ? item.cursor : getCursor(item);

    // if there's still not a cursor, return false by default
    return itemCursor ? cursor === itemCursor : false;
  });

  console.log("cursorIndex? ", cursorIndex);

  let wtf =
    cursorIndex >= 0
      ? cursorIndex === results.length - 1 // don't let us overflow
        ? []
        : results.slice(
            cursorIndex + 1,
            Math.min(results.length, cursorIndex + 1 + pageSize)
          )
      : results.slice(0, pageSize);

  console.log("wtf: ", wtf);
  return wtf;
};
