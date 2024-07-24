# Example 1. Berkeley data on Temperature anomaly.
# Here we analyze corelations between the elements of a large matrix and comunity structure.

# 1) Read data

# 1.1) ORIGINAL DATA
require(ncdf4)
path2temp<-"/media/gegp/DATA/gaia/temperatures/Land_and_Ocean_EqualArea.nc"
nc <- nc_open(path2temp)

lon <- ncvar_get(nc, "longitude")
lat <- ncvar_get(nc, "latitude")
TIME <- ncvar_get(nc, "time")
tem <- ncvar_get(nc, "temperature")
climatology = ncvar_get(nc, "climatology")
nc_close(nc)

# 1.2) INTERPOLATED DATA
Z10 = readRDS("~/gaia/figures/Berkeley_filled_progressively_with_10yrs.rds")
X = Z10

# MAKE AN INDEX FOR THE GEOGRAPHIC ELEMENTS (ROWS) IN THE MATRIX

