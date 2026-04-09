"""
cottoncast/ml/model.py - 3-Layer Stacked LSTM with Bahdanau Attention
"""

import tensorflow as tf
from tensorflow.keras import layers, models, optimizers


@tf.keras.utils.register_keras_serializable(package="CottonCast")
class BahdanauAttention(layers.Layer):
    def __init__(self, units: int = 64, **kwargs):
        super().__init__(**kwargs)
        self.units = units

    def build(self, input_shape):
        hidden_dim = input_shape[-1]
        self.W = self.add_weight(
            name="W_att",
            shape=(hidden_dim, self.units),
            initializer="glorot_uniform",
            trainable=True,
        )
        self.b = self.add_weight(
            name="b_att",
            shape=(self.units,),
            initializer="zeros",
            trainable=True,
        )
        self.v = self.add_weight(
            name="v_att",
            shape=(self.units, 1),
            initializer="glorot_uniform",
            trainable=True,
        )
        super().build(input_shape)

    def call(self, inputs, return_weights: bool = False):
        score = tf.nn.tanh(tf.tensordot(inputs, self.W, axes=[-1, 0]) + self.b)
        alignment = tf.tensordot(score, self.v, axes=[-1, 0])
        weights = tf.nn.softmax(alignment, axis=1)
        context = tf.reduce_sum(weights * inputs, axis=1)

        if return_weights:
            return context, tf.squeeze(weights, axis=-1)
        return context

    def get_config(self):
        cfg = super().get_config()
        cfg.update({"units": self.units})
        return cfg


def build_cottoncast_model(
    input_shape: tuple = (60, 12),
    lstm_units: list = [128, 64, 32],
    dropout_rate: float = 0.2,
    learning_rate: float = 1e-3,
) -> tf.keras.Model:
    inputs = layers.Input(shape=input_shape, name="sequence_input")

    x = layers.LSTM(lstm_units[0], return_sequences=True, name="lstm_1")(inputs)
    x = layers.Dropout(dropout_rate, name="dropout_1")(x)

    x = layers.LSTM(lstm_units[1], return_sequences=True, name="lstm_2")(x)
    x = layers.Dropout(dropout_rate, name="dropout_2")(x)

    x = layers.LSTM(lstm_units[2], return_sequences=True, name="lstm_3")(x)
    x = layers.Dropout(dropout_rate, name="dropout_3")(x)

    context = BahdanauAttention(units=64, name="bahdanau_attention")(x)

    dense = layers.Dense(32, activation="relu", name="dense_proj")(context)
    dense = layers.BatchNormalization(name="bn")(dense)
    dense = layers.Dropout(dropout_rate, name="dropout_proj")(dense)

    outputs = layers.Dense(1, activation="linear", name="price_head")(dense)

    model = models.Model(inputs=inputs, outputs=outputs, name="CottonCast_LSTM_Attention")
    model.compile(
        optimizer=optimizers.Adam(learning_rate=learning_rate, clipnorm=1.0),
        loss=tf.keras.losses.Huber(delta=1.0),
        metrics=["mae", tf.keras.metrics.RootMeanSquaredError(name="rmse")],
    )
    return model
