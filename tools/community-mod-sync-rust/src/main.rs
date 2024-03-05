use axum::{
    routing::post,
    http::StatusCode,
    Json, Router,
};
use serde_json::Value;
use std::net::SocketAddr;
use std::fs;

#[tokio::main]
async fn main() {
    let (non_blocking, _guard) = tracing_appender::non_blocking(std::io::stdout());
    tracing_subscriber::fmt().with_writer(non_blocking).init();
    
    let app = Router::new()
        .route("/", post(receive_data));

    let addr = SocketAddr::from(([127, 0, 0, 1], 3002));
    tracing::info!("listening on {}", addr);
    axum::Server::bind(&addr)
        .serve(app.into_make_service())
        .await
        .unwrap();
}
async fn receive_data(
    body: String,
) -> (StatusCode, Json<&'static str>) {
    match process_data(body) {
        Some(_) => (),
        None => tracing::info!("Failed to save data"),
    }

    (StatusCode::OK, Json(""))
}
fn process_data(body: String) -> Option<()> {
    let payload: Vec<Value> = serde_json::from_str(&body).ok()?;
    for item in payload {
        write_item(item)?;
    }
    Some(())
}

fn write_item(value: Value) -> Option<()> {
    let data_type = value.pointer("/type")?.as_str()?;
    let journal_id = value.pointer("/journal/id")?.as_i64()?;
    fs::create_dir_all(format!("./data/{}", data_type)).ok()?;
    fs::write(format!("./data/{}/{}.json", data_type, journal_id), value.to_string()).ok()?;
    tracing::info!("saved journal {}", journal_id);
    Some(())
}
