sleepit <- function(x)
{
    p1 <- proc.time()
    Sys.sleep(x)
    proc.time() - p1 # The cpu usage should be negligible
}

print('Sleeping for 60s')
print(sleepit(60))
print('Done sleeping')

