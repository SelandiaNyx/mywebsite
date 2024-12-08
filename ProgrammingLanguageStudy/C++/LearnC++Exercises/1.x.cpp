/*
Enter an integer: 6
Enter another integer: 4
6 + 4 is 10.
6 - 4 is 2.
*/
#include <iostream>
int main()
{
    // Define variables
    int num1{}, num2{};

    // Get input from keyboard
    std::cout << "Enter an integer: ";
    std::cin >> num1;
    std::cout << "Enter another integer: ";
    std::cin >> num2;

    // Output results
    std::cout << num1 << " + " << num2 << " is " << num1 + num2 << std::endl;
    std::cout << num1 << " - " << num2 << " is " << num1 - num2 << std::endl;

    return 0;
}