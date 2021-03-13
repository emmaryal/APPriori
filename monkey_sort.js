// The comparison matrix
function ComparisonMatrix(items) {
  var self = this;
  self.items = items;
  self.matrix = {};
  self.explicitCount = 0;

  _.each(self.items, function (item) {
    self.matrix[item] = {};
    self.matrix[item][item] = "=";
  });
  self.opposite = function (value) {
    return value == "=" ? "=" : value == "<" ? ">" : "<";
  };

  self.get = function (a, b) {
    if (self.matrix[a][b]) {
      return self.matrix[a][b];
    } else {
      throw { items: [a, b] };
    }
  };
  self.set = function (a, b, value) {
    self.explicitCount++;
    self.updateSingle(a, b, value);
    self.updateSingle(b, a, self.opposite(value));
  };
  self.updateSingle = function (a, b, value) {
    self.matrix[a][b] = value;
    self.updateTransitive(a, b);
  };

  self.updateTransitive = function (a, b) {
    if (self.matrix[a][b] == "=") {
      // ((Cij = “=”) ⋀ (Cjk is known)) ⇒ Cik = Cjk
      _.each(_.keys(self.matrix[b]), function (c) {
        if (!self.matrix[a][c]) {
          self.updateSingle(a, c, self.matrix[b][c]);
        }
      });
    } else {
      // (Cij ∈ { “<”, “>”}) ⋀ (Cjk ∈ {Cij, “=”}) ⇒ Cik = Cij
      _.each(_.keys(self.matrix[b]), function (c) {
        if (
          !self.matrix[a][c] &&
          (self.matrix[a][b] == self.matrix[b][c] || self.matrix[b][c] == "=")
        ) {
          self.updateSingle(a, c, self.matrix[a][b]);
        }
      });
    }
  };
}

// This is the very simplest form of quick sort.
// Unknown comparison interrupt is done inside the matrix.get() method
function quickSort(items, matrix) {
  var array = items;
  console.log("items (array) in quicksort fn", array); //!!!!! keeps adding the deleted items
  function qsortPart(low, high) {
    var i = low;
    var j = high;
    var x = array[Math.floor((low + high) / 2)];
    do {
      while (matrix.get(array[i], x) == ">") i++;
      while (matrix.get(array[j], x) == "<") j--;
      if (i <= j) {
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
        i++;
        j--;
      }
    } while (i <= j);
    if (low < j) {
      qsortPart(low, j);
    }
    if (i < high) {
      qsortPart(i, high);
    }
  }
  qsortPart(0, array.length - 1);
}

$(function () {
 
  var matrix;
  // var lines = [];
  // var items = [];
  // var count = 0;

  ///DISCARD DIV ///
  $("#discard-button").click(function () {
    $("#input").hide();
    $("#to-be-discarded").show();
    $("#discard-page").show();
    $("#ask").hide();
    $("#results").hide();

    var lines = [];
    var items = [];
    var count = 0;

    //show each item in list
    $.each($("#items").val().split(/\n/), function (i, line) {
      if (line) {
        lines.push(line);
      } else if (line == /\n/) {
        null;
        // lines.push("");
      }
    });

    console.log("lines from text input", lines);
    let Uniq_lines = [...new Set(lines)];

    // var Uniq_lines = lines.filter(function (elem, index, self) {
    //   return index === self.indexOf(elem);
    // });
    console.log("unique lines array", Uniq_lines);
    lines = [...Uniq_lines];
    console.log("unique lines", lines);
    localStorage.setItem("lines", [...lines]);
    console.log("lines[0]", lines[0]);
    // then do unique filter

    // console.log("items from input:", lines);

    // localStorage.setItem("storedLines", JSON.stringify($("#items").val()));

    // console.log("lines length=", lines.length);
    // console.log("count:", count);
    $("#to-be-discarded").html(lines[0]);

    $("#keep-in-list-button").show();
    $("#discard-from-list-button").show();
    items = [];

    function nextQuestion() {
      count++;
      // lines = localStorage.getItem("lines").split(",");
      // console.log("LINES--", localStorage.getItem("lines"));
      // console.log("LINES from variable via localstorage--", lines);
      // let linesArray = lines.split(",")

      console.log("lines:", lines);
      console.log("lines.length", lines.length);
      console.log("count:", count); //(? count has not reset to zero)
      console.log("items", items);

      $("#to-be-discarded").html(lines[count]);
      if (count === lines.length) {
        $("#to-be-discarded").hide();
        $("#keep-in-list-button").hide();
        $("#discard-from-list-button").hide();
        $("h2").hide();
        $("#show-trimmed").text(items);
        $("#submit").show();
      }
    }

    // $("#to-be-discarded").html(lines[0]);

    $("#discard-from-list-button").click(() => {
      nextQuestion();
      // lines.splice(0, 1);
      // console.log("discarded:", lines[count]);
      // $("#to-be-discarded").html(lines[0]);
    });

    $("#keep-in-list-button").click(() => {
      // console.log("lines", lines);
      // const added = lines.splice(0,1).slice(0,1)
      // items.push(...added);
      // $("#to-be-discarded").html(lines[1]);
      // console.log("kept", lines[count]);
      items.push(lines[count]);

      // console.log("items aftertrimming", items);
      localStorage.setItem("items", items); //overwrites items array

      nextQuestion();
    });
  });

  $("#submit-no-trim").click(function (e) {
    e.preventDefault();
    // items = _(
    //   _(
    //     _($("#items").val().split("\n")).map(function (s) {
    //       return s.trim();
    //     })
    //   ).reject(function (s) {
    //     return s === "";
    //   })
    // ).uniq();
    var items = localStorage.getItem("items").split(",");
    $("results").hide();
    console.log("items after skipping  trim (from local storage", items);
    matrix = new ComparisonMatrix(items);
    tryQuickSort();
  });

  ///ASK DIV///
  $("#submit").click(function (e) {
    e.preventDefault();
    // items = _(
    //   _(
    //     _($("#items").val().split("\n")).map(function (s) {
    //       return s.trim();
    //     })
    //   ).reject(function (s) {
    //     return s === "";
    //   })
    // ).uniq();
    var items = localStorage.getItem("items").split(",");
    $("results").hide();
    console.log("items after submitting trim (from local storage", items);
    matrix = new ComparisonMatrix(items);
    tryQuickSort();
  });

  function tryQuickSort() {
    t = localStorage.getItem("items").split(",");
    console.log("items (t) in quicksort fn", t);
    try {
      quickSort(t, matrix);
      showResults();
    } catch (e) {
      // console.log("catch", e);
      askUser(e.items[0], e.items[1]); //these are items from comparison matrix
    }
  }

  function askUser(a, b) {
    $("#input").hide();
    $("#discard-page").hide();
    $("#ask").show();
    $("results").hide();
    $("#ask_a").text(a);
    $("#ask_b").text(b);
  }

  $(".ask_answer").click(function (e) {
    e.preventDefault();
    var a = $("#ask_a").text();
    var b = $("#ask_b").text();
    var result = $(this).data("result");
    console.log("result:", result)
    matrix.set(a, b, result);
    tryQuickSort();
  });

  ///RESULTS DIV///
  function showResults() {
    $("#input").hide();
    $("#ask").hide();
    $("#results").show();
    $("#results_list").html();

    $("#explicit_count").text(matrix.explicitCount);
    $("#explicit_count").show();
    _(items).each(function (item) {
      $("<li />").appendTo($("#results_list")).text(item);
    });
  }

  $("#start_over_clean").click(function (e) {
    window.location.replace("list.html").reload();
    lines = [];
    items = [];
  });

  $("#start_over_same_list").click(function (e) {
    lines = localStorage.getItem("lines").split(",").join("\n");
    $("#input").show();
    $("#results").hide();
    $("#items").val(lines).show();
    items = [];
    count1 = 0;
  });
});
