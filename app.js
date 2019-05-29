
// BUDGET CONTROLLER
////////////////////////////////////////////////////////////////
var budgetController = (function() {
	var Expense = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.persentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.persentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.persentage = -1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.persentage;
	}

	var Income = function(id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	var calculateTotal = function(type) {
		var sum = 0;

		data.allItems[type].forEach(function(current) {
			sum += current.value;
		});

		data.totals[type] = sum;
	};

	var data = {
		allItems: {
			exp: [],
			inc: []
		},
		totals: {
			exp: 0,
			inc: 0
		},
		budget: 0,		
		persentage: -1
	};

	return {
		addItem: function(type, des, val) {
			var newItem, ID;
			// Create new ID
			if (data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}
		

			// Create new Item based on 'exp' or 'inc' type
			if (type === 'exp') {
				newItem = new Expense(ID, des, val);
			} else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			// Push it into our new data srtucture
			data.allItems[type].push(newItem);

				// Return the new element
			return newItem;		
		},

		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
				}


		},

		calculateBadget: function() {

			// calculate total income and expenses
				calculateTotal('exp');
				calculateTotal('inc');
			// calculate the badget: income - expenses
				data.budget = data.totals.inc - data.totals.exp;
			// calculate the persentage of incom that we spent
			if (data.totals.inc > 0) {
				data.persentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			} else {
				data.persentage = -1;
			}
		},
		calculatePercentages: function() {

			data.allItems.exp.forEach(function(current) {
					current.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {

			var allPerc = data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});
			return allPerc;

		},

		getBudget: function() {
				return {
					budget: data.budget,
					totalInc: data.totals.inc,
					totalExp: data.totals.exp,
					persentage: data.persentage
				}
		},

		testing: function() {
			console.log(data);
		}

	};

})();



// UI CONTROLLER
/////////////////////////////////////////////////////////////////
var UIController = (function(){
	var DOMsrtings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incLabel: '.budget__income--value',
		expLabel: '.budget__expenses--value',
		persentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLable: '.item__percentage',
		dateLable: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
			var numSplit, int, dec, type;

			num = Math.abs(num);
			num = num.toFixed(2);

			numSplit = num.split('.');

			int = numSplit[0];

			if (int.length > 3) {
				int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
			}
			dec = numSplit[1];
			
			return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
		};
		var nodeListForEach = function(list, callback) {
				for (var i = 0; i < list.length; i++) {
					callback(list[i], i);
				}
			};

	return {
		getInput: function () {
			return {
			type: document.querySelector(DOMsrtings.inputType).value,
			description: document.querySelector(DOMsrtings.inputDescription).value,
			value: parseFloat(document.querySelector(DOMsrtings.inputValue).value) 
			};
		},
		addListItem: function(obj, type) {

			var html, newHtml, element;
			// Create HTML string with some placeholder
				if (type === 'inc') {
					element = DOMsrtings.incomeContainer;

					html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
				} else if (type === 'exp') {
					element = DOMsrtings.expensesContainer;

					html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
				}			

			// Repleace some placeholder with some actual data
				newHtml = html.replace('%id%', obj.id);
				newHtml = newHtml.replace('%description%', obj.description);
				newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// Insert the HTML ito the DOM
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},
		deleteListItem: function(selectorId) {
			var el = document.getElementById(selectorId);
			el.parentNode.removeChild(el);

		},
		clearFields: function() {
			var fields, fieldsArray;

			fields = document.querySelectorAll(DOMsrtings.inputDescription + ', ' + DOMsrtings.inputValue);

			fieldsArray = Array.prototype.slice.call(fields);

			fieldsArray.forEach(function(currentValue, indexNumber, array) {
				currentValue.value = "";				
			});

			fieldsArray[0].focus();
		},

		displayBudget: function(obj) {

			document.querySelector(DOMsrtings.budgetLabel).textContent = obj.budget;
			document.querySelector(DOMsrtings.incLabel).textContent = obj.totalInc;
			document.querySelector(DOMsrtings.expLabel).textContent = obj.totalExp;
		
			if (obj.persentage > 0) {
					document.querySelector(DOMsrtings.persentageLabel).textContent = obj.persentage + ' %';

			} else {
				document.querySelector(DOMsrtings.persentageLabel).textContent = '--';
			}
		},
		displayPercentages: function(percentages) {

			var fields = document.querySelectorAll(DOMsrtings.expensesPercLable);
			
			nodeListForEach(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});
		},

		displayMonth: function() {
			var now, year, month, months;
			now = new Date();

			months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
			month = now.getMonth();

			year = now.getFullYear();
			document.querySelector(DOMsrtings.dateLable).textContent = months[month] + ' ' + year;

		},		
		changedType: function() {

			var fields = document.querySelectorAll(
				DOMsrtings.inputType + ',' + 
				DOMsrtings.inputDescription + ',' + 
				DOMsrtings.inputValue);

			nodeListForEach(fields, function(cur) {
				cur.classList.toggle('red-focus');
			});
			document.querySelector(DOMsrtings.inputBtn).classList.toggle('red');


		},

		getDomString: function() {
			return DOMsrtings;
		}
	};

})();




// GLOBAL APP CONTROLLER
///////////////////////////////////////////////////////////////////
var controller = (function(budgetCtrl, UiCtrl) {
	
	var setupEventListeners = function() {
			var DOM = UiCtrl.getDomString();
			document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
			document.addEventListener('keypress', function(event) {
		 		if (event.keyCode === 13 || event.which === 13) {
		 		ctrlAddItem();
		 }		
	});
			document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
			document.querySelector(DOM.inputType).addEventListener('change', UiCtrl.changedType);
	};

	var updatePersentages = function() {

			// 1. calculate persentages
				budgetCtrl.calculatePercentages();
			// 2. read persentages from the budget controller
				var percentages = budgetCtrl.getPercentages();
			// 3. update the UI with the new persentages
				UiCtrl.displayPercentages(percentages);
			// 

	};

	var updateBudget = function() {
		// 1. Culculate the budget
			budgetCtrl.calculateBadget();
		// 2. Return the budget
			var budget = budgetCtrl.getBudget();
		// 3. Display the budget on the UI
		UiCtrl.displayBudget(budget);
	};

	var ctrlAddItem = function(){
		var input, newItem;
		
		// 1. Get field the input data
		input = UiCtrl.getInput();

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
			// 2. Add the item to the budget controller
			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			// 3. Add the item to UI
			UiCtrl.addListItem(newItem, input.type);
			// 4. Clear the fields
			UiCtrl.clearFields();
			// 5. Calculate and update the budget
			updateBudget(); 
			// 6. Calculate and update the persentages
			updatePersentages();
		}		
	};

	var ctrlDeleteItem = function(event) {
		var itemId, splitId, type, ID;
			itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
			if (itemId) {

				// Split the string in to peaces and convert it into an Arrey
				splitId = itemId.split('-');
				type = splitId[0];
				ID = parseInt(splitId[1]);

				// 1. delete the item from the data structure
				budgetCtrl.deleteItem(type, ID);
				// 2. delete the item from the UI
					UiCtrl.deleteListItem(itemId);
				// 3. update and show new budget
					updateBudget(); 
				// 4. Calculate and update the persentages
				updatePersentages();

			}
	}
	return {
		inith: function() {
			console.log('Aplication has started.');
			UiCtrl.displayMonth();
			UiCtrl.displayBudget({
					budget: 0,
					totalInc: 0,
					totalExp: 0,
					persentage: -1
				});
			setupEventListeners();			
		}
	};

})(budgetController, UIController);

controller.inith();

	







































