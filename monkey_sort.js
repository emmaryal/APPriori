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
  var items;

  $("#submit").click(function (e) {
    e.preventDefault();
    items = _(
      _(
        _($("#items").val().split("\n")).map(function (s) {
          return s.trim();
        })
      ).reject(function (s) {
        return s === "";
      })
    ).uniq();
    matrix = new ComparisonMatrix(items);
    tryQuickSort();
  });

  function tryQuickSort() {
    try {
      quickSort(items, matrix);
      showResults();
    } catch (e) {
      askUser(e.items[0], e.items[1]);
    }
  }

  function askUser(a, b) {
    $("#input").hide();
    $("#ask").show();
    $("#ask_a").text(a);
    $("#ask_b").text(b);
  }

  $(".ask_answer").click(function (e) {
    e.preventDefault();
    var a = $("#ask_a").text();
    var b = $("#ask_b").text();
    var result = $(this).data("result");
    matrix.set(a, b, result);
    tryQuickSort();
  });

  function showResults() {
    $("#input").hide();
    $("#ask").hide();
    $("#results").show();
    $("#results_list").html();
    $("#explicit_count").text(matrix.explicitCount);
    _(items).each(function (item) {
      $("<li />").appendTo($("#results_list")).text(item);
    });
  }

  $("#start_over").click(function (e) {
    e.preventDefault();
    $("#results").hide();
    $("#input").show();
  });
});
