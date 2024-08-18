import numpy as np
import pandas as pd
import joblib

from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.model_selection import train_test_split, cross_val_score

data=pd.read_csv('dataset/heart.csv')

numeric_col=data.select_dtypes(include=np.number).columns.to_list()
categorical_col=data.select_dtypes(exclude=np.number).columns.to_list()

def handle_outliers(data, feature):
    Q1 = data[feature].quantile(0.25)
    Q3 = data[feature].quantile(0.75)
    IQR = Q3 - Q1
    lower_limit = Q1 - 1.5 * IQR
    upper_limit = Q3 + 1.5 * IQR

    data[feature]=np.where(data[feature] > upper_limit, upper_limit, np.where(data[feature] < lower_limit, lower_limit, data[feature]))
    return data[feature]

for feature in numeric_col:
    data[feature] = handle_outliers(data, feature)


le=LabelEncoder()
for i in categorical_col:
  data[i]=le.fit_transform(data[i])
  data[i]=data[i].astype('int')


x=data.drop(['HeartDisease'],axis=1)
y=data['HeartDisease']

y=y.astype('int')

x_train,x_test,y_train,y_test=train_test_split(x,y,test_size=0.2,random_state=42)


scalar=MinMaxScaler()
x_train=scalar.fit_transform(x_train)
x_test=scalar.transform(x_test)

lr=LogisticRegression(max_iter=1000)
lr.fit(x_train,y_train)
cv=cross_val_score(lr,x_train,y_train,cv=5)
print(cv)
print(cv.mean())


print(lr.score(x_train,y_train))

print(lr.score(x_test,y_test))

print(x_test)

joblib.dump(lr, 'model/heart-disease.joblib')

for x, y in zip(x_test, y_test):
  pred = lr.predict([x])[0]
  if pred == y:
    print(x)