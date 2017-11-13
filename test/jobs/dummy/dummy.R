fileTest<-file("test.txt")
writeLines(c("Hello","World"), fileTest)
print('Hello World!')
close(fileTest)
