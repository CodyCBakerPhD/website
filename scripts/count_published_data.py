#!/usr/bin/env python3
"""Counts the dandisets the owner has published on the DANDI Archive and how
much data they hold uncompressed, which backs up the sizes that the Data
Curation records give.

An NWB file's size is the sum of the in-memory sizes of its datasets, read by
streaming the file from the archive, so a run reads every NWB file the owner
published and takes a while. Any other file's size is the one in its metadata.

It needs dandi, h5py and remfile, and a DANDI API key in DANDI_API_KEY:

    pip install dandi h5py remfile
    read -rs DANDI_API_KEY && export DANDI_API_KEY
    python scripts/count_published_data.py
"""

import os
import sys

import dandi.dandiapi
import h5py
import remfile

# DANDI does not list this one among the owner's own, so it is added by ID.
EXTRA_DANDISET_IDS = ("000409",)

# The dandisets behind each size a Data Curation record gives.
RECORD_DANDISET_IDS = {
    "datasets/c-elegans-signal-propagation": ("001075",),
    "datasets/visual-coding-ophys": ("000728",),
    "datasets/ibl-brain-wide-map": ("000409",),
    "datasets/glia-futility": ("000350",),
    "datasets/buzsaki-lab": (
        "000003",
        "000041",
        "000044",
        "000056",
        "000059",
        "000061",
        "000166",
        "000213",
        "000218",
        "000233",
        "000552",
        "000568",
    ),
}


def get_asset_url(asset: dandi.dandiapi.RemoteAsset) -> str:
    return asset.get_content_url(follow_redirects=1, strip_query=True)


def get_uncompressed_object_size(object_: h5py.Group | h5py.Dataset) -> int | None:
    try:
        if isinstance(object_, h5py.Group):
            object_size = sum(get_uncompressed_object_size(object_=child) for child in object_.values())
        elif isinstance(object_, h5py.Dataset):
            object_size = object_.nbytes
        else:
            message = f"Unsupported object type: {type(object_)}"
            raise NotImplementedError(message)
    except Exception as exception:
        print(f"Failed to calculate size for {object_}\n\n{type(exception)}:\n{exception}\n")
        object_size = None

    return object_size


def get_uncompressed_file_size(url: str, asset_path: str) -> int | None:
    try:
        file = h5py.File(name=remfile.File(url=url), mode="r")
    except Exception as exception:
        print(f"Failed to open handle for {asset_path}\n\n{type(exception)}:\n{exception}\n")
        return None

    with file:
        return get_uncompressed_object_size(object_=file)


def get_uncompressed_size_in_bytes_per_dataset(
    datasets: dict[str, dandi.dandiapi.RemoteDandiset],
) -> dict[str, dict[str, int | None]]:
    size_in_bytes_per_dataset = {}
    for dataset_path, dataset in datasets.items():
        size_in_bytes_per_asset = {}
        for asset in dataset.get_assets():
            if asset.path.endswith(".nwb"):
                size_in_bytes_per_asset[asset.path] = get_uncompressed_file_size(
                    url=get_asset_url(asset=asset), asset_path=asset.path
                )
            else:
                size_in_bytes_per_asset[asset.path] = asset.get_raw_metadata()["contentSize"]
        size_in_bytes_per_dataset[dataset_path] = size_in_bytes_per_asset
    return size_in_bytes_per_dataset


def main() -> None:
    token = os.environ.get("DANDI_API_KEY")
    if not token:
        sys.exit("Set DANDI_API_KEY to your DANDI API key (see this script's docstring).")
    client = dandi.dandiapi.DandiAPIClient(token=token)

    datasets_published_by_me = {
        dataset.api_path: dataset for dataset in client.get_dandisets(draft=False, mine=True)
    }
    for dandiset_id in EXTRA_DANDISET_IDS:
        datasets_published_by_me[f"/dandisets/{dandiset_id}/"] = client.get_dandiset(dandiset_id=dandiset_id)

    number_of_published_datasets = sum(
        len(dataset.get_raw_metadata()["publishedBy"]) > 0 for dataset in datasets_published_by_me.values()
    )
    print(f"Number of datasets published by me: {number_of_published_datasets}")

    uncompressed_size_in_bytes_per_asset = get_uncompressed_size_in_bytes_per_dataset(datasets=datasets_published_by_me)
    total_size_in_bytes_per_dataset = {
        dataset_path: sum(size_in_bytes for size_in_bytes in sizes.values() if size_in_bytes is not None)
        for dataset_path, sizes in uncompressed_size_in_bytes_per_asset.items()
    }
    total_size_in_bytes = sum(total_size_in_bytes_per_dataset.values())
    print(f"Total size of all published datasets: {total_size_in_bytes / 1e12:,.2f} TB")

    for record, dandiset_ids in RECORD_DANDISET_IDS.items():
        size_in_bytes = sum(total_size_in_bytes_per_dataset[f"/dandisets/{dandiset_id}/"] for dandiset_id in dandiset_ids)
        print(f"Total size for {record}: {size_in_bytes / 1e12:,.1f} TB")


if __name__ == "__main__":
    main()
