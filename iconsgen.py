# Python code to
# demonstrate readlines()

L = ["Geeks\n", "for\n", "Geeks\n"]

# writing to file
file1 = open('myfile.txt', 'w')
file1.writelines(L)
file1.close()

# Using readlines()
file1 = open('myfile.txt', 'r')
Lines = file1.readlines()

count = 0
# Strips the newline character
for line in Lines:
    print("Line{}: {}".format(count, line.strip()))
