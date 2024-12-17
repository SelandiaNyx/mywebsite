#include <iostream>
#include <limits>

// Function to get a valid integer input from the user
int getValidIntegerInput(const std::string& prompt) {
    int number;
    while (true) {
        std::cout << prompt;
        if (std::cin >> number) {
            return number;
        } else {
            std::cerr << "Invalid input. Please enter an integer." << std::endl;
            std::cin.clear(); // Clear the error flag
            std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n'); // Discard invalid input
        }
    }
}

// Function to perform and display addition
void displayAddition(int num1, int num2) {
    std::cout << num1 << " + " << num2 << " is " << num1 + num2 << std::endl;
}

// Function to perform and display subtraction
void displaySubtraction(int num1, int num2) {
    std::cout << num1 << " - " << num2 << " is " << num1 - num2 << std::endl;
}

int main() {
    char choice;
    do {
        // Get input from keyboard
        int num1 = getValidIntegerInput("Enter an integer: ");
        int num2 = getValidIntegerInput("Enter another integer: ");

        // Output results
        displayAddition(num1, num2);
        displaySubtraction(num1, num2);

        // Ask the user if they want to perform another calculation
        std::cout << "Do you want to perform another calculation? (y/n): ";
        std::cin >> choice;
        std::cin.ignore(std::numeric_limits<std::streamsize>::max(), '\n'); // Discard remaining input

    } while (choice == 'y' || choice == 'Y');

    return 0;
}