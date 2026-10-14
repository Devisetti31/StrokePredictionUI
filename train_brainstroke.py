import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline,make_pipeline
from sklearn.preprocessing import LabelEncoder,OneHotEncoder,StandardScaler

from sklearn.metrics import accuracy_score,confusion_matrix,classification_report,f1_score

df = pd.read_csv("Brain.csv")
df

df.info()

df.isnull().sum()

df.duplicated().sum()

X = df.drop('stroke',axis=1)
y = df['stroke']

categorical_columns = X.select_dtypes('object').columns
numerical_columns = X.select_dtypes(exclude='object').columns

preprocessor = ColumnTransformer(transformers=[('categorical',OneHotEncoder(drop='first'),categorical_columns),
                                               ('numerical',StandardScaler(),numerical_columns)],
                                                remainder='passthrough')

x_train,x_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state=42)

model = RandomForestClassifier(random_state=42)

PPL = Pipeline(steps = [('preprocessor',preprocessor),
                        ('model',model)])

PPL.fit(x_train,y_train)

y_pred = PPL.predict(x_test)

accuracy_score(y_test,y_pred)

print(classification_report(y_test,y_pred))

confusion_matrix(y_test,y_pred)

import joblib

joblib.dump(PPL,'brainstroke_model.pkl')

